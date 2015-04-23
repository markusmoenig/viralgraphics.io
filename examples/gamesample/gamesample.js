GameSample=function()
{
    VG.UI.RenderWidget.call(this);

    /* Holds a reference of this object */
    var obj = this;


    /* Our 3d camera object */
    var camera = new VG.Render.Camera(60, this.rect.width / this.rect.height);
    camera.setRotation(0, -10, 0);
    camera.position.z = 30.0;
    camera.position.y = 3.0;


    /* A render context can be used to render a single scene multiple times with scpecial
       metadata built into it, ie. a shadowMap context, works toguether with a piepline and
       scene manager */
    var context = new VG.Render.Context();
    context.camera = camera;


    /* The  pipeline dictates how things get rendered and in which order */
    var pipeline = new VG.Render.Pipeline();


    /* The scene manager implements optimizations for realtime rendering, 
       it can also be extended for more complex usages */
    var scene = new VG.Render.SceneManager();


    var bricks = []


    /* Utility function to add a brick to the scene */
    function addBrickAt(x, y, vertical)
    {
        var brick = VG.Render.Mesh.makeBox(vertical ? 1 : 8, vertical ? 8 : 1, 4.0);

        brick.position.set(x, y, 0.0);

        brick.parent = scene
            
        /* Some meta data */
        brick.vertical = true;;

        bricks.push(brick);
    } 

    addBrickAt(-7, 0, true);
    addBrickAt(-10, 0, true);
    addBrickAt(-13, 0, true);
    addBrickAt(7, 0, true);
    addBrickAt(10, 0, true);
    addBrickAt(13, 0, true);



    /* We expand the brick from scene node (mesh is also an scene node) so we
       can have the transform utilities built into our object like
       rotation translation and simple collision. */



    /* Ball class, handles collision and restituition, extends from SceneNode
       we use a class so we can spawn multiple balls and collide with each other */
    var Ball = function()
    {
        VG.Render.SceneNode.call(this);

        /* A simple primitive rectangle */
        this.mesh = VG.Render.Mesh.makeSphere(1);
        this.mesh.parent = this;

        /* Add ourselves to the scene manager */
        this.parent = scene;


        /* The velocity of the ball in units per second */
        this.velocity = new VG.Math.Vector3(6, 1, 0);

        this.tick = function(delta)
        {
            var bounds = this.mesh.getBounds();

            var collided = false;

            for (var i = 0; i < bricks.length; i++)
            {
                if (bricks[i].parent && bricks[i].getBounds().overlaps(bounds))
                {
                    /* Any node that has no parent wont be rendered, in this case we are
                       kind of disabling it, if we re-parent it we can use it again */
                    bricks[i].parent = null;

                    collided = true;
                    break;
                }
            }

            /* Since we are doing collision let's clamp the delta for more stability */
            if (delta > 0.0333)
            {
                delta = 0.0333;
            }

            if (collided)
            {
                this.velocity.negate();

                /* Depenetrate by steping the time a little */
                delta *= 2;
            }

            /* Apply the velocity to the ball */
            this.position.addMul(this.velocity, delta);


            /* Add some rotation to the mesh, since the mesh is a child of the ball
               node it will spine on it's own local space while traveling accross */
            this.mesh.incRotation(130 * delta, 140 * delta, -130 * delta);
        }
    }

    Ball.prototype = Object.create(VG.Render.Mesh.prototype);







    ball = new Ball();

   

    this.render = function(delta)
    {
        //TODO update aspect ratio on a resize callback not here / everyframe
        camera.aspect = this.rect.width / this.rect.height;
        camera.updateProjection();

        ball.tick(delta);
        
        /* Draws the scene with the pipeline and the given render context */
        pipeline.drawScene(context, scene, delta);
    }
}

GameSample.prototype = Object.create(VG.UI.RenderWidget.prototype);



function vgMain(workspace)
{
    /* GameSample expands from a RenderWidget that way we can use it for general 2d/3d
       rendering and also to  get input and resize events */
    var renderWidget = new GameSample(); 

    var mainLayout = VG.UI.Layout(renderWidget);
    workspace.layout = mainLayout;
}
