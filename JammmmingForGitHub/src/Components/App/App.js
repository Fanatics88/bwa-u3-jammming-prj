import React from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify'

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchResults: [],
      playlistName: 'New Playlist',
      playlistTracks: []
    }

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  addTrack(track) {
    let count = true;
    for (var i = 0; i < this.state.playlistTracks.length; i++) {
      if (track.id === this.state.playlistTracks[i].id) {
        count = false;
      }
    }
    if (count) {
      let currentPlaylistArray = this.state.playlistTracks.concat(track);
      this.setState({ playlistTracks: currentPlaylistArray });
    }
  }

  removeTrack(track) {
    let currentPlaylistArray = this.state.playlistTracks;
    this.setState({ playlistTracks: currentPlaylistArray.filter(checkTrack => checkTrack.id !== track.id) });
  }

  updatePlaylistName(name) {
    this.setState({ playlistName: name });
  }

  savePlaylist() {
    const trackURIs = this.state.playlistTracks.map(track => track.uri);
    Spotify.savePlaylist(this.state.playlistName, trackURIs);
    this.setState({ playlistTracks: [], searchResults: [], playlistName: 'New Playlist' });
  }

  search(term) {
    Spotify.search(term)
    .then(results => Array.from(results))
    .then(trackArray => {
      if (trackArray.length === 0) {
        this.setState({ searchResults: [{
          name: 'NOT FOUND',
          artist: '?',
          album: 'Try again with a new search',
          id: 'NOTFOUND'
        }] });
      } else {
        this.setState({ searchResults: trackArray });
      };
    });
  }

  render() {
    return(
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults
              searchResults={this.state.searchResults}
              onAdd={this.addTrack} />
            <Playlist
              playlistName={this.state.playlistName}
              playlistTracks={this.state.playlistTracks}
              onRemove={this.removeTrack}
              onNameChange={this.updatePlaylistName}
              onSave={this.savePlaylist} />
          </div>
        </div>
      </div>
    )
  }
}

export default App;
