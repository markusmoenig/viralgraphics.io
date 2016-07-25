function vgMain( workspace, argc, arg )
{
    var label=VG.UI.Label( "Hello World!");
    label.horizontalExpanding=true; // Center it horizontally

    workspace.content=VG.UI.Layout( label );
};