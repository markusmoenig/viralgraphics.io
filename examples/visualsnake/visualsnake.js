/*
 * (C) Copyright 2014, 2015 Krishnakanth Mallik <krishnakanthmallikc@gmail.com>.
 *
 * This file is part of Visual Graphics.
 *
 * Visual Graphics is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Visual Graphics is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Visual Graphics.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/*
 * VisualSnake layout setup on the window.
 */
VisualSnake = function()
{
    var workspace = VG.context.workspace;

    this.renderWidget = new VisualSnake.RenderWidget();

    this.renderLayout = VG.UI.Layout(this.renderWidget);
    this.renderLayout.vertical = true;

    this.mainLayout = VG.UI.Layout();
    this.mainLayout.addChild(this.renderLayout);

    workspace.layout = this.mainLayout;
}

/*
 * Game configs
 */
VisualSnake.Properties = {

    BlockSide : 10, // Side of each block.
    MaxRows : 60,
    MaxCols : 80,
    WorldColor : VG.Core.Color(0, 0, 0),
    BoundsColor : VG.Core.Color(255, 255, 255),
    SnakeColor : VG.Core.Color(255, 255, 255),
    FoodColor : VG.Core.Color(255, 0, 0),
    FrameTime : 0.06,  // time elapsed before each update. 60 milliseconds
    StartingBlocks : 3, 
    BlocksToAddPerFood : 3
}

/*
 * Creates a mesh of a quad of specified width and height.
 *
 * @param {number} : width of the quad
 * @param {number} : height of the quad
 *
 * @returns {VG.Render.Mesh}
 */
VisualSnake.createQuadMesh = function(width, height)
{
    var mesh = new VG.Render.Mesh();
    mesh.init(6, 0);

    mesh.setTriangle(0, 
        [
            {position : [0.0, 0.0, 0.0, 1.0], normal : [0.0, 0.0, 1.0] },
            {position : [width, 0.0, 0.0, 1.0], normal : [0.0, 0.0, 1.0] },
            {position : [0.0, height, 0.0, 1.0], normal : [0.0, 0.0, 1.0] }
        ]
    );

    mesh.setTriangle(1, 
        [
            {position : [0.0, height, 0.0, 1.0], normal : [0.0, 0.0, 1.0] },
            {position : [width, 0.0, 0.0, 1.0], normal : [0.0, 0.0, 1.0] },
            {position : [width, height, 0.0, 1.0], normal : [0.0, 0.0, 1.0] }
        ]
    );

    mesh.update();

    return mesh;
}

/*
 * Checks two positions for collision. 
 * Returns true if collision happend, false if not
 *
 * @param {VG.Math.Vector2} : First position
 * @param {VG.Math.Vector2} : Second position
 *
 * @returns {bool}
 */
VisualSnake.positionCompare = function(pos1, pos2)
{
    return pos1 && pos2 && pos1.x == pos2.x && pos1.y == pos2.y;
}

/*
 * Creates a new material.
 */
VisualSnake.Material = function()
{
    var vSrc = 
        '#version 100\n\n' +
        'attribute vec4 position;\n' +
        'attribute vec3 normal;\n' +

        'uniform mat4 projMatrix;\n' +
        'uniform mat4 transformMatrix;\n' +

        'void main() {\n' +
        '  vec3 n = normal;\n' +
        '  mat4 m = projMatrix * transformMatrix;\n' +
        '  gl_Position =  m * position;\n' +
        '}\n';

    var fSrc = 
        '#version 100\n\n' +
        'precision mediump float;\n' +

        'uniform vec3 diffuse;\n' +

        'void main() {\n' +
        '  gl_FragColor = vec4(diffuse.rgb, 1.0);\n' +
        '}\n';

    this.shader = new VG.Shader(vSrc, fSrc);
    this.shader.blendType = VG.Shader.Blend.Alpha;
    this.shader.create();

    this.diffuse = VG.Core.Color(0, 0, 0);
}

VisualSnake.Material.prototype.bind = function()
{
    this.shader.bind();
    this.shader.setColor3("diffuse", this.diffuse);
}

/*
 * Orthographic projection matrix
 */
VisualSnake.projMatrix = new VG.Math.Matrix4();


VisualSnake.Game = function()
{
    /*
     *
     * Snake
     *
     * Creates a new Snake object
     *
    *///------------------------------------------------------------------------------
    Snake = function()
    {

        Snake.Direction = {

            LEFT : -1,
            RIGHT : 1,
            UP : 2,
            DOWN : -2,
            NONE : 0
        }

        /*
         *
         * Block
         *
         * A snake is made up of a doubly linked list of blocks.
         * Creates a new block object
         *
        *///------------------------------------------------------------------------------
        Block = function()
        {
            this.position = new VG.Math.Vector2();

            // Quad that visually represents the block.
            this.mesh = VisualSnake.createQuadMesh(VisualSnake.Properties.BlockSide, VisualSnake.Properties.BlockSide);

            this.transform = new VG.Math.Matrix4();

            // Transformation matrix of the world.
            this.parentTransform = new VG.Math.Matrix4();

            this.position = new VG.Math.Vector2();

            this.prev = null;
            this.next = null;
        }

        /*
         * Renders the block mesh
         */
        Block.prototype.draw = function(shader)
        {
            this.transform.setIdentity();
            this.transform.concat(this.parentTransform);
            this.transform.translate(this.position.x, this.position.y, 0);

            shader.setMatrix("transformMatrix", this.transform.elements);
            VG.Renderer().drawMesh(this.mesh, -1, shader);
        }

        //------------------------------------------------------------------------------

        this.material = new VisualSnake.Material();
        this.material.diffuse = VisualSnake.Properties.SnakeColor;

        // Queue holding the next changes to direction to apply on the snake.
        this.moves = [];

        this.length = 0;

        this.blocksToAdd = VisualSnake.Properties.StartingBlocks;

        this.dead = false;

        // Time accumulator.
        this.accum = 0;

        // The function that will check for collisions of the
        // Snake with itself and other objects in the world
        this.collisionFunc = null;
    }

    /*
     * Initialises the snake.
     */
    Snake.prototype.init = function(transformMatrix, x, y)
    {
        this.parentTransform = new VG.Math.Matrix4(transformMatrix);
        this.direction = Snake.Direction.RIGHT;
        this.head = this.tail = this.createBlock(x, y);
        this.length = 1;
    }

    /*
     * Registers the collision checking function for the Snake with other objects in the world
     * Binds "obj" to it as the caller object.
     */
    Snake.prototype.registerCollisionFunc = function(obj, func)
    {
        this.collisionFunc = func.bind(obj);
    }

    /*
     * Creates and initialises a new block.
     * Sets its position to x,y
     */
    Snake.prototype.createBlock = function(x, y)
    {
        var block = new Block();
        block.parentTransform = new VG.Math.Matrix4(this.parentTransform);

        if(this.head)
        {
            block.targetPosition = new VG.Math.Vector2(x, y);
            block.position = new VG.Math.Vector2(this.head.position.x, this.head.position.y);
        }
        else
            block.targetPosition = block.position = new VG.Math.Vector2(x, y);

        return block;
    }

    /*
     * Queues the newDirection as the next move to the moves queue.
     * Else queues the current direction.
     */
    Snake.prototype.move = function(newDirection)
    {
        var previousDirection = this.moves.length ? this.moves[this.moves.length-1] : this.direction;

        if(newDirection != previousDirection && newDirection != -previousDirection)
            this.moves.push(newDirection);
    }

    /*
     * Adds the block to the head of the snake.
     */
    Snake.prototype.push = function(block)
    {
        ++this.length;

        if(this.head)
        {
            this.head.prev = block;
            block.next = this.head;
        }

        this.head = block;
    }

    /*
     * Removes a tail block.
     */
    Snake.prototype.pop = function()
    {
        --this.length;
        if(this.tail.prev)
        {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }
    }

    /*
     * Calls push() to add a block to snake's head in the given direction.
     */
    Snake.prototype.increase = function(direction)
    {
        this.direction = direction && direction != 0 ? direction : this.direction;

        switch(this.direction)
        {
            case Snake.Direction.LEFT:
                this.push( this.createBlock(this.head.position.x - VisualSnake.Properties.BlockSide , this.head.position.y) );
                break;
            case Snake.Direction.RIGHT:
                this.push( this.createBlock(this.head.position.x + VisualSnake.Properties.BlockSide, this.head.position.y) );
                break;
            case Snake.Direction.UP:
                this.push( this.createBlock(this.head.position.x, this.head.position.y - VisualSnake.Properties.BlockSide) );
                break;
            case Snake.Direction.DOWN:
                this.push( this.createBlock(this.head.position.x, this.head.position.y + VisualSnake.Properties.BlockSide) );
                break;
        }
    }

    /*
     * Calls pop() to remove tail blocks for the snake unless
     * the snake has to increase in length.
     */
    Snake.prototype.decrease = function()
    {
        if( this.blocksToAdd)
            --this.blocksToAdd;
        else
            this.pop();
    }

    /*
     * Returns true if the Snake head collided with its body.
     */
    Snake.prototype.collidedSelf = function()
    {
        var block = this.head.next.next;
        while(block)
        {
            if(VisualSnake.positionCompare(this.head.position, block.position))
                return true;

            block = block.next;
        }

        return false;
    }

    /*
     * Update the movement of the Snake.
     */
    Snake.prototype.update = function(delta)
    {
        // Accumulate time elapsed until frame time is reached.
        this.accum += delta;

        if(this.accum > VisualSnake.Properties.FrameTime)
        {
            // Retain any excess delta time for the next update.
            this.accum -= VisualSnake.Properties.FrameTime;

            // Snap the head position on the world grid.
            // This can cause jitters on low framerates.
            this.head.position.x = this.head.targetPosition.x;
            this.head.position.y = this.head.targetPosition.y;

            /* The snake moves by adding a block to the head
             * and popping a block off the tail.
             *
             *   Direction of movement ------>
             *   _ _ _ _ _ _ _               _ _ _ _ _ _ _ _                     _ _ _ _ _ _ _ 
             *  |_|_|_|_|_|_|_|             |_|_|_|_|_|_|_|_|                   |_|_|_|_|_|_|_|       
             *   /\          /\              /\            /\                 /\  
             *  tail        head    tail (to be removed)  head(newly added)   (removed tail)
             */
            this.increase(this.moves.shift());
            this.decrease();

            this.collisionFunc();
        }

        // Interpolate the head position for a smooth movement.
        this.head.position.x += (this.head.targetPosition.x - this.head.position.x) * this.accum / VisualSnake.Properties.FrameTime;
        this.head.position.y += (this.head.targetPosition.y - this.head.position.y) * this.accum / VisualSnake.Properties.FrameTime;

        if(this.head != this.tail && this.head.next != this.tail && this.tail && this.tail.prev)
        {
            this.tail.position.x += (this.tail.prev.position.x - this.tail.position.x) * this.accum / VisualSnake.Properties.FrameTime;
            this.tail.position.y += (this.tail.prev.position.y - this.tail.position.y) * this.accum / VisualSnake.Properties.FrameTime
        }
    }

    /*
     * Draws the snake
     */
    Snake.prototype.draw = function()
    {
        this.material.bind();

        this.material.shader.setMatrix("projMatrix", VisualSnake.projMatrix.elements);

        // Draw each of the blocks.
        var block = this.head;

        while(block)
        {
            block.draw(this.material.shader);
            block = block.next;
        }
    }

    //------------------------------------------------------------------------------



    /*
     *
     * Food
     *
     * Creates a new block of food.
     *
    *///------------------------------------------------------------------------------
    Food = function()
    {
        this.position = new VG.Math.Vector2();

        this.material = new VisualSnake.Material();
        this.material.diffuse = VisualSnake.Properties.FoodColor;

        // Quad that visually represents the food.
        this.mesh = VisualSnake.createQuadMesh(VisualSnake.Properties.BlockSide, VisualSnake.Properties.BlockSide);

        this.transform = new VG.Math.Matrix4();

        // The worlds transformation matrix
        this.parentTransform = new VG.Math.Matrix4();
    }

    /*
     * Initialises a block of food.
     * Sets parent transform and sets the position
     * of the food block to x, y
     */
    Food.prototype.init = function(parentTransform, x, y)
    {
        this.parentTransform = parentTransform;
        this.transform.setIdentity();
        this.transform.concat(this.parentTransform);
        this.position = new VG.Math.Vector2(x, y);

        this.transform.translate(this.position.x, this.position.y, 0);
    }

    /*
     * Draws the food
     */
    Food.prototype.draw = function()
    {
        this.material.bind();

        this.material.shader.setMatrix("projMatrix", VisualSnake.projMatrix.elements);
        this.material.shader.setMatrix("transformMatrix", this.transform.elements);
        VG.Renderer().drawMesh(this.mesh, -1, this.material.shader);
    }

    //------------------------------------------------------------------------------

    this.material = new VisualSnake.Material();

    this.ready = false;
}

/*
 * Spawns a block of food at a random position on the world.
 */
VisualSnake.Game.prototype.spawnFood = function()
{
    var x = Math.floor(Math.random() * (this.width - VisualSnake.Properties.BlockSide));
    var y = Math.floor(Math.random() * (this.height - VisualSnake.Properties.BlockSide));

    x = x - (x % VisualSnake.Properties.BlockSide);
    y = y - (y % VisualSnake.Properties.BlockSide);

    if(!this.food)
        this.food = new Food();   
    
    this.food.init(this.transform, x, y);
}

/*
 * Checks for and handles collisions with self, bounds of the world,
 * or food blocks.
 */
VisualSnake.Game.prototype.checkCollisions = function()
{
    // Handle collision with food.
    if(VisualSnake.positionCompare(this.snake.head.position, this.food.position))
    {
        this.snake.blocksToAdd += VisualSnake.Properties.BlocksToAddPerFood;
        this.spawnFood();
    }

    // Handle collision with self or with world bounds
    if(this.snake.collidedSelf() 
        || this.snake.head.position.x < 0 
        || this.snake.head.position.x >= this.bounds.width 
        || this.snake.head.position.y < 0
        || this.snake.head.position.y >= this.bounds.height)
    {
        this.reset();
    }
}

/*
 * Reset the snake.
 */
VisualSnake.Game.prototype.reset = function()
{
    this.snake.dead = true;
    this.ready = false;
}

/*
 * Main update loop of the game.
 * Updates and renders all entities.
 */
VisualSnake.Game.prototype.update = function(delta)
{
    // Draw boundary.
    this.material.diffuse = VisualSnake.Properties.BoundsColor;
    this.material.bind();
    this.material.shader.setMatrix("projMatrix", VisualSnake.projMatrix.elements);
    this.material.shader.setMatrix("transformMatrix", this.boundsTransform.elements);
    VG.Renderer().drawMesh(this.boundsQuad, -1, this.material.shader);

    // Draw world.
    this.material.diffuse = VisualSnake.Properties.WorldColor;
    this.material.bind();
    this.material.shader.setMatrix("projMatrix", VisualSnake.projMatrix.elements);
    this.material.shader.setMatrix("transformMatrix", this.transform.elements);
    VG.Renderer().drawMesh(this.worldQuad, -1, this.material.shader);

    if(this.ready)
        this.snake.update(delta);

    this.snake.draw();
    this.food.draw();
}

/*
 * Initialise the game.
 */
VisualSnake.Game.prototype.init = function(width, height)
{
    // Calculate a world size that is a multiple of block size.
    // This ensures that our snake fits in it neatly.
    var maxWidth = VisualSnake.Properties.BlockSide * VisualSnake.Properties.MaxCols;
    var maxHeight = VisualSnake.Properties.BlockSide * VisualSnake.Properties.MaxRows;

    this.width = Math.min(maxWidth, width - (width % VisualSnake.Properties.BlockSide));
    this.height = Math.min(maxHeight, height - (height % VisualSnake.Properties.BlockSide));

    //@TODO Do this again when the viewport is resized
    var x = (width - this.width) / 2;
    var y = (height - this.height) / 2;
    var w = this.width;
    var h = this.height;

    /*
     * Do this when the viewport is resized
    var aspectRatio = maxWidth / maxHeight;

    if(width < this.width)
    {
        x = 0;
        w = this.width = width;
        h = this.height = this.width / aspectRatio;
        y = (height - this.height) / 2;
    }
    if(height < this.height)
    {
        y = 0;
        h = this.height = height;
        w = this.width = this.height * aspectRatio;
        x = (width - this.width) / 2;
    }*/

    this.bounds = VG.Core.Rect(x, y, w, h);

    // Centre the world in the viewport.
    this.transform = new VG.Math.Matrix4();
    this.transform.translate( this.bounds.x,
                                this.bounds.y,
                                0);

    // Centre the bounds rectangle in the viewport.
    this.boundsTransform = new VG.Math.Matrix4();
    this.boundsTransform.translate( this.bounds.x - VisualSnake.Properties.BlockSide,
                                this.bounds.y - VisualSnake.Properties.BlockSide,
                                0);

    // Create world and bounds quads.
    this.worldQuad = VisualSnake.createQuadMesh(this.width, this.height);
    this.boundsQuad = VisualSnake.createQuadMesh(this.width + 2 * VisualSnake.Properties.BlockSide, this.height + 2 * VisualSnake.Properties.BlockSide);

    // Create the orthographic projection matrix
    VisualSnake.projMatrix.setOrtho(0, width, height, 0, 1, 0);

    // Here comes the Snake!
    this.snake = new Snake();

    var halfW = this.width / 2;
    var halfH = this.height/ 2;
    var snakeX = halfW - halfW % VisualSnake.Properties.BlockSide;
    var snakeY = halfH - halfH % VisualSnake.Properties.BlockSide;

    this.snake.init(this.transform, snakeX, snakeY);
    this.snake.registerCollisionFunc(this, this.checkCollisions);

    // Put food on the table!
    this.spawnFood();

    // Ready to go!
    this.initialised = true;
    this.ready = true;
}

/*
 * Extends VG.UI.RenderWidget
 *
 * Gives us the functionality to do custom 2D/3D rendering.
 */
VisualSnake.RenderWidget = function()
{   
    VG.UI.RenderWidget.call(this);

    var game = new VisualSnake.Game();

    /*
     * @Override 
     *
     * Overriden keyEvent listener.
     *
     * @param keyCode : Key code of the key that was pressed.
     * @param keysDown : Array of all the keys that are currently pressed.
     */
    this.keyUp = function(keyCode, keysDown)
    {
        switch(keyCode)
        {
            case VG.Events.KeyCodes.ArrowUp:
                game.snake.move(Snake.Direction.UP);
                break;
            case VG.Events.KeyCodes.ArrowDown:
                game.snake.move(Snake.Direction.DOWN);
                break;
            case VG.Events.KeyCodes.ArrowLeft:
                game.snake.move(Snake.Direction.LEFT);
                break;
            case VG.Events.KeyCodes.ArrowRight:
                game.snake.move(Snake.Direction.RIGHT);
                break;
            case VG.Events.KeyCodes.Space:
                if(game.snake.dead) game.initialised = false;
                game.ready = !game.ready;
                break;
        }
    }

    /*
     * @Override
     *
     * Overriden drawing method of VG.UI.RenderWidget.
     *
     * @param delta : Time elapsed since the last call to render()
     */
    this.render = function(delta)
    {
        if(!game.initialised)
            game.init(this.rect.width, this.rect.height);

        // Update our game
        game.update(delta);
    }
}

VisualSnake.RenderWidget.prototype = Object.create(VG.UI.RenderWidget.prototype);

/*
 * VG entry point
 */
function vgMain( workspace )
{
    var visualSnake = new VisualSnake();
}