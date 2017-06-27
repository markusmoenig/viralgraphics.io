
// --- Save the given VG.Core.Image under the given name as PNG

function debugSaveImage( name, image, format )
{
    var params = {};

    params.filename = name;
    params.content = VG.compressImage( image, format );

    VG.downloadRequest("/api/download?binary=true", params, "POST");
}

// --- Save the given RenderTarget under the given name as PNG

function debugSaveRenderTarget( name, rt, format )
{
	var image=VG.Utils.renderTargetToImage( rt );

    var params = {};

    params.filename = name;
    params.content = VG.compressImage( image, format );

    VG.downloadRequest("/api/download?binary=true", params, "POST");
}