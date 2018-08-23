Editor = class Editor extends VG.UI.Widget
{
    constructor( dc )
    {
        super();

        this.dc = dc;
    }

    paintWidget( canvas )
    {
        let ctx = canvas.ctx;
        let rect = new VG.Core.Rect();

        for( let i = 0; i < this.dc.shapes.length; ++i )
        {
            let shape = this.dc.shapes[i];

            // We could use the canvas context directly, but we prefer the abstraction layer
            // ctx.save();
            // ctx.fillStyle = shape.color;
            // ctx.rect( this.rect.x + shape.pos[0], this.rect.y + shape.pos[1], shape.size, shape.size );
            // ctx.fill();
            // ctx.restore();

            rect.set( this.rect.x + shape.pos[0], this.rect.y + shape.pos[1], shape.size, shape.size );
            canvas.draw2DShape( VG.Canvas.Shape2D.Rectangle, rect, new VG.Core.Color( shape.color ) );
        }
    }
};