const deezer =
    require("../providers/deezer");

const youtube =
    require("../providers/youtube");

async function search(q) {

    const deezerResults =
        await deezer.search(q);

    const youtubeResults =
        await youtube.search(q);

    return [

        ...deezerResults,

        ...youtubeResults

    ];

}

async function song(q) {

    const results =
        await search(q);

    return results.length
        ? results[0]
        : null;

}

module.exports = {

    search,

    song

};
