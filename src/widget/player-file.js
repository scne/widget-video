var file;

function configure(urls){
  file = urls;

  var filePlayer = function () {
    return playerJW({
      file: file,
      type: getVideoFileType(file),
      width : width,
      height : height,
      controls: false,
      stretching : stretching,
      skin: skin
    });
  };

  player = filePlayer();
}
