let accessToken;
let expiresIn;
const clientID = '48ca9279ba62420d803ad66f5b60be94';
const redirectURI = 'http://localhost:3000/';
const apiURL = 'https://api.spotify.com/v1';

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    } else {
      let temp = window.location.href.match(/access_token=([^&]*)/);
      if (temp) {
        accessToken = temp[1];
        temp = window.location.href.match(/expires_in=([^&]*)/);
        expiresIn = temp[1];
        window.setTimeout(() => accessToken = '', expiresIn * 1000);
        window.history.pushState('Access Token', null, '/');
      } else {
        const redirectUrl = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
        window.location = redirectUrl;
      }
    }
  },

  search(term) {
    if (!accessToken) {
      Spotify.getAccessToken();
    }
    const searchUrl = `${apiURL}/search?type=track&q=${term}`;
    const headers = { headers: { Authorization: `Bearer ${accessToken}` } };
    return fetch(searchUrl,  headers)
    .then(response => response.json())
    .then(jsonResponse => {
      if (!jsonResponse.tracks) { return []; }
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }));
    });
  },

  savePlaylist(playlistName, trackURIs) {
    if (!playlistName || !trackURIs) {
      return;
    } else {
      const accessToken = Spotify.getAccessToken();
      const headers = { Authorization: `Bearer ${accessToken}` };
      let userId;
      let url = `${apiURL}/me`;

      return fetch(url, { headers: headers })
      .then(response => response.json())
      .then(jsonResponse => {
        userId = jsonResponse.id;
        return fetch(`${apiURL}/users/${userId}/playlists`, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({ name: playlistName })
        }).then(response => response.json()
        ).then(jsonResponse => {
          const playlistId = jsonResponse.id;
          return fetch(`${apiURL}/users/${userId}/playlists/${playlistId}/tracks`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({ uris: trackURIs })
          });
        });
      });
    }
  }
};

export default Spotify;
