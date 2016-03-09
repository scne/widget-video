var files;

function configure(urls) {
  files = urls;

  var folderPlayer = function () {
    var instance = playerJW({
      playlist: getPlaylist(files),
      width : width,
      height : height,
      controls: false,
      stretching : stretching,
      skin: skin
    });

    instance.onPlayerError = function (error) {
      if (error) {
        errorEvent({
          type: "video",
          index: jwplayer().getPlaylistIndex(),
          message: error.message
        });
      }
    };

    instance.onSetupError = function (error) {
      if (error) {
        errorEvent({
          type: "setup",
          index: 0,
          message: error.message
        });
      }
    };

    instance.getCurrentIndex = function() {
      return jwplayer().getPlaylistIndex();
    };

    return instance;
  };

  player = folderPlayer();
}

function getPlaylist (list) {
  var playlist = [];

  for (var i = 0; i < list.length; i += 1) {
    playlist.push({
      sources: [{
        file: list[i],
        type: getVideoFileType(list[i])
      }]
    });
  }

  return playlist;
}
