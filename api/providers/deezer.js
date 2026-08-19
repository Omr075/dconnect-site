const axios = require("axios");

async function search(query){

    const response =
        await axios.get(
            `https://api.deezer.com/search?q=${encodeURIComponent(query)}`
        );

    return response.data.data.map(track => ({

        title: track.title,

        artist: track.artist.name,

        album: track.album.title,

        cover: track.album.cover_medium,

        preview: track.preview,

        source: "deezer"

    }));

}

module.exports = {

    search

};
