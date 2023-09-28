// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================
class Track {
  static #list = []

  constructor(name, author, image) {
    this.id = Math.floor(1000 + Math.random() * 9000) //Генеруємо випадкове id
    this.name = name
    this.author = author
    this.image = image
  }

  static create(name, author, image) {
    const newTrack = new Track(name, author, image)
    this.#list.push(newTrack)
    return newTrack
  }
  static getList() {
    return this.#list.reverse()
  }
}

Track.create(
  'Highway to Hell',
  'AC/DC',
  'https://picsum.photos/100/100',
)
Track.create(
  'Duality',
  'Slipknot',
  'https://picsum.photos/100/100',
)
Track.create(
  'Hands of time',
  'Groove Armada',
  'https://picsum.photos/100/100',
)
Track.create(
  '6:00',
  'Grandson',
  'https://picsum.photos/100/100',
)
Track.create(
  'ABCDEFU',
  'Leo Moracchioli',
  'https://picsum.photos/100/100',
)
Track.create(
  'After midnight',
  'Ran`g Bone Man',
  'https://picsum.photos/100/100',
)
Track.create(
  'Too Much',
  'Jacob Banks',
  'https://picsum.photos/100/100',
)
Track.create(
  'Colors',
  'Black Pumas',
  'https://picsum.photos/100/100',
)

console.log(Track.getList())

class Playlist {
  static #list = []

  constructor(name, image) {
    this.id = Math.floor(1000 + Math.random() * 9000) //Генеруємо випадкове id
    this.name = name
    this.tracks = []
    this.image = image || 'https://picsum.photos/100/100'
  }

  static create(name, image) {
    const newPlaylist = new Playlist(name, image)
    this.#list.push(newPlaylist)
    return newPlaylist
  }

  // Статичний метод для отримання всього списку товарів
  static getList() {
    return this.#list.reverse()
  }

  static makeMix(playlist) {
    const allTracks = Track.getList()

    let randomTracks = allTracks
      .sort(() => 0.5 - Math.random())
      .splice(0, 3)

    playlist.tracks.push(...randomTracks)
  }

  static getById(id) {
    return (
      Playlist.#list.find(
        (playlist) => playlist.id === id,
      ) || null
    )
  }

  deleteTrackById(trackId) {
    this.tracks = this.tracks.filter(
      (track) => track.id !== trackId,
    )
  }

  static findListByValue(name) {
    return this.#list.filter((playlist) =>
      playlist.name
        .toLowerCase()
        .includes(name.toLowerCase()),
    )
  }
}

Playlist.makeMix(
  Playlist.create('Favorites', '/img/favorites.jpg'),
)

Playlist.makeMix(Playlist.create('Mixed', '/img/mixed.jpg'))

Playlist.makeMix(
  Playlist.create('Random', '/img/random.jpg'),
)

Playlist.makeMix(
  Playlist.create('My playlist', '/img/my-playlist.jpg'),
)

// ================================================================
router.get('/', function (req, res) {
  allTracks = Track.getList()
  console.log(allTracks)

  const allPlaylists = Playlist.getList()
  console.log(allPlaylists)

  res.render('spotify-choose', {
    style: 'spotify-choose',

    data: {
      list: allPlaylists.map(({ tracks, ...rest }) => ({
        ...rest,
        amount: tracks.length,
      })),
    },
  })
})

// ================================================================

router.get('/spotify-search', function (req, res) {
  const value = ''
  const list = Playlist.findListByValue(value)

  res.render('spotify-search', {
    style: 'spotify-search',

    data: {
      list: list.map(({ tracks, ...rest }) => ({
        ...rest,
        amount: tracks.length,
      })),
      value,
    },
  })
})

// ================================================================

router.post('/spotify-search', function (req, res) {
  const value = req.body.value || ''
  const list = Playlist.findListByValue(value)

  console.log(value)

  res.render('spotify-search', {
    style: 'spotify-search',

    data: {
      list: list.map(({ tracks, ...rest }) => ({
        ...rest,
        amount: tracks.length,
      })),
      value,
    },
  })
})
// ================================================================
router.get('/spotify-choose', function (req, res) {
  res.render('spotify-choose', {
    style: 'spotify-choose',

    data: {},
  })
})

// ================================================================
router.get('/spotify-create', function (req, res) {
  const isMix = !!req.query.isMix

  console.log(isMix)

  res.render('spotify-create', {
    style: 'spotify-create',

    data: {
      isMix,
    },
  })
})

// ================================================================

router.post('/spotify-create', function (req, res) {
  console.log(req.body, req.query)

  const isMix = !!req.query.isMix
  const name = req.body.name

  if (!name) {
    return res.render('spotify-alert', {
      style: 'spotify-alert',

      data: {
        message: 'Some trouble',
        info: 'Please, write neme playlist',
        link: isMix
          ? '/spotify-create?isMix=true'
          : '/spotify-create',
      },
    })
  }

  const playlist = Playlist.create(name)

  if (isMix) {
    Playlist.makeMix(playlist)
  }

  console.log(playlist)

  res.render('spotify-playlist', {
    style: 'spotify-playlist',

    data: {
      playlistId: playlist.id,
      tracks: playlist.tracks,
      name: playlist.name,
      image: playlist.image,
    },
  })
})

// ================================================================

router.get('/spotify-playlist', function (req, res) {
  const id = Number(req.query.id)
  const playlist = Playlist.getById(id)

  if (!playlist) {
    return res.render('spotify-alert', {
      style: 'spotify-alert',

      data: {
        message: 'Some trouble',
        info: '(ﾉ´ヮ`)ﾉ*: ･ﾟ',
        link: '/',
      },
    })
  }

  res.render('spotify-playlist', {
    style: 'spotify-playlist',

    data: {
      playlistId: playlist.id,
      tracks: playlist.tracks,
      name: playlist.name,
    },
  })
})

// ================================================================

router.get('/spotify-track-delete', function (req, res) {
  const playlistId = Number(req.query.playlistId)
  const trackId = Number(req.query.trackId)
  const playlist = Playlist.getById(playlistId)

  if (!playlist) {
    return res.render('spotify-alert', {
      style: 'spotify-alert',

      data: {
        message: 'Some trouble',
        info: '(ﾉ´ヮ`)ﾉ*: ･ﾟ',
        link: `/spotify-playlist?id=${playlistId}`,
      },
    })
  }

  playlist.deleteTrackById(trackId)

  res.render('spotify-playlist', {
    style: 'spotify-playlist',

    data: {
      playlistId: playlist.id,
      tracks: playlist.tracks,
      name: playlist.name,
    },
  })
})
// ================================================================
router.get('/spotify-track-add', function (req, res) {
  const playlistId = Number(req.query.playlistId)
  const playlist = Playlist.getById(playlistId)
  const allTracks = Track.getList()

  console.log(playlistId, playlist, allTracks)

  res.render('spotify-track-add', {
    style: 'spotify-track-add',

    data: {
      playlistId: playlist.id,
      tracks: allTracks,
      // link: `/spotify-track-add?playlistId={{playlistId}}&trackId=={{id}}`,
    },
  })
})

// ================================================================

router.post('/spotify-track-add', function (req, res) {
  const playlistId = Number(req.body.playlistId)
  const trackId = Number(req.body.trackId)

  const playlist = Playlist.getById(playlistId)

  if (!playlist) {
    return res.render('spotify-alert', {
      style: 'spotify-alert',
      data: {
        message: 'Помилка',
        info: 'Такого плейліста не знайдено',
        link: `/spotify-playlist?id=${playlistId}`,
      },
    })
  }

  const trackToAdd = Track.getList().find(
    (track) => track.id === trackId,
  )

  if (!trackToAdd) {
    return res.render('spotify-alert', {
      style: 'spotify-alert',
      data: {
        message: 'Помилка',
        info: 'Такого треку не знайдено',
        link: `/spotify-track-add?playlistId=${playlistId}`,
      },
    })
  }

  playlist.tracks.push(trackToAdd)

  res.render('spotify-playlist', {
    style: 'spotify-playlist',
    data: {
      playlistId: playlist.id,
      tracks: playlist.tracks,
      name: playlist.name,
    },
  })
})
// ================================================================
// Підключаємо роутер до бек-енду
module.exports = router
