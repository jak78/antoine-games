let gameStarted = false
let distanceTraveled = 0
let saved_speed = 0
let musicTracks = []
let currentMusicIndex = -1
let musicPlaybackId = 0

// Cette fonction est exécutée une seule fois
async function setup() {
  const canvas = createCanvas(900, 600);
  canvas.parent('game-container')
  Hud.setup()
  vaisseau = await loadImage('vaisseau.png');
  obstacle = await loadImage('magma.png');
  obstacle_moving_img = await loadImage('obstacle_3_reacteur_energetique.png')
  pause_img = await loadImage('pause.png')
  fond_etoiles= await loadImage('01_etoiles.png')
  fond_nebuleuse= await loadImage('02_nebuleuses_2.png')
  fond_planetes= await loadImage('04_planetes_premier_plan.png')
  game_over_img = await loadImage('game_over.png')
  musicTracks = await Promise.all([
    loadSound('music/01_slay_the_evil.mp3'),
    loadSound('music/15_rush_point.mp3')
  ])
  const startButton = document.getElementById('start-button')
  startButton.addEventListener('click', () => {
    if(gameStarted) return
    startButton.blur()
    startButton.hidden = true
    gameStarted = true
    resetGame()
  })
  startButton.disabled = false
}

function switchMusic() {
  const playbackId = ++musicPlaybackId
  if(currentMusicIndex === -1) {
    currentMusicIndex = Math.floor(Math.random() * musicTracks.length)
  } else {
    const previousTrack = musicTracks[currentMusicIndex]
    previousTrack.onended(() => {})
    previousTrack.stop()
    currentMusicIndex = (currentMusicIndex + 1) % musicTracks.length
  }
  const track = musicTracks[currentMusicIndex]
  const endsAt = getAudioContext().currentTime + track.duration()
  track.onended(() => {
    if(playbackId !== musicPlaybackId) return
    // stop() peut aussi declencher onended, meme apres un nouveau play().
    if(getAudioContext().currentTime < endsAt) return
    switchMusic()
  })
  if(!pause && !gameover) userStartAudio()
  track.play()
}

function resetGame() {
  distanceTraveled = 0

  speed_origine = 2.3;
  acceleration_origine = 0.001;
  speed = speed_origine;
  acceleration = acceleration_origine;
  saved_speed = speed
  
  pause = false
  gameover = false
  gameoverTime = 0

  spaceship_x = 40
  spaceship_y = 150
  spaceship_w = 150
  spaceship_h = 100
 
  fond_etoilesX=0
  fond_nebuleuseX=0
  fond_planetesX=0

  obstacles_x = [370, 800]
  obstacles_y = [300, 0]
  obstacles_w = [100, 100]
  obstacles_h = [300, 300]

  obstacle_moving = false

  switchMusic()
}

function makeGameOver() {
  if(gameover) return
  if(!pause) saved_speed = speed
  speed = 0
  acceleration = 0
  gameover = true
  gameoverTime = millis()
  userStopAudio()
}

function displayGameOver() {
  image(game_over_img, 200, 150, 500, 300);
}
function displayPause() {
  image(pause_img, 200, 220, 500, 150);
}

// Cette fonction est exécutée en boucle
function draw() {
  if(!gameStarted) {
    background(0,0,0)
    image(fond_etoiles,0,0,900,600)
    image(fond_planetes,0,0,900,600)
    return
  }

  // Commandes du vaisseau
  if (!pause && !gameover) {
    spaceship_y = mouseY
    if (mouseY >500) {spaceship_y =500}
  }

  // 1. Dessiner le fond spatial
  background(0,0,0)
  image(fond_etoiles,fond_etoilesX,0,900,600)
  image(fond_etoiles,fond_etoilesX+900,0,900,600)
  image(fond_nebuleuse,fond_nebuleuseX,0,900,600)
  image(fond_nebuleuse,fond_nebuleuseX+900,0,900,600)
  image(fond_planetes,fond_planetesX,0,900,600)
  image(fond_planetes,fond_planetesX+900,0,900,600)
  
  // Dessin des sprites
  image(vaisseau, spaceship_x, spaceship_y, spaceship_w, spaceship_h);
  image(obstacle_moving ? obstacle_moving_img : obstacle,obstacles_x[0],obstacles_y[0],obstacles_w[0],obstacles_h[0])
  image(obstacle, obstacles_x[1],obstacles_y[1],obstacles_w[1],obstacles_h[1])
  if(pause) {
    displayPause()
  }
  if(gameover) {
    displayGameOver()
  }
  Hud.draw(speed, saved_speed, pause, gameover, distanceTraveled)
  
  // Coordonnées des obstacles :
  obstacles_x[0] = obstacles_x[0] - speed
  obstacles_x[1] = obstacles_x[1] - speed
  if(obstacles_x[0] < -100) {
    obstacles_x[0] = 900
    if(Math.random() < (1.0/3.5) && speed < 4*2.3) {
      obstacle_moving = true
      obstacles_h[0] = 100
      obstacles_w[0] = 50
    } else {
      obstacle_moving = false
      obstacles_h[0] = 300
      obstacles_w[0] = 100
    }
    if(obstacles_y[1] == 0) {
      pos_autorisee_1 = 150
      pos_autorisee_2 = 300
    }
    if(obstacles_y[1] == 150) {
      pos_autorisee_1 = 0
      pos_autorisee_2 = 300
    }
    if(obstacles_y[1] == 300) {
      pos_autorisee_1 = 0
      pos_autorisee_2 = 150
    }
    if(Math.random() < 0.5) {
      obstacles_y[0] = pos_autorisee_1
    } else {
      obstacles_y[0] = pos_autorisee_2
    }    
  }
  if(obstacles_x[1] < -100) {
    obstacles_x[1] = 900
    if(obstacles_y[0] == 0) {
      pos_autorisee_1 = 150
      pos_autorisee_2 = 300
    }
    if(obstacles_y[0] == 150) {
      pos_autorisee_1 = 0
      pos_autorisee_2 = 300
    }
    if(obstacles_y[0] == 300) {
      pos_autorisee_1 = 0
      pos_autorisee_2 = 150
    }
    if(Math.random() < 0.5) {
      obstacles_y[1] = pos_autorisee_1
    } else {
      obstacles_y[1] = pos_autorisee_2
    }
  }
  if(obstacle_moving && ! pause) {
    // Fais varier la coordonnée Y de l'obstacle de façon sinusoidale
    obstacles_y[0] = 250 + 250 * Math.sin(distanceTraveled / speed / 50)
  }

  // Parallaxes :
  fond_etoilesX=fond_etoilesX-speed/5
  if (fond_etoilesX< -900) {fond_etoilesX = 0}
  fond_nebuleuseX=fond_nebuleuseX-speed/3
  if (fond_nebuleuseX< -900) {fond_nebuleuseX = 0}
  fond_planetesX=fond_planetesX-speed/2
  if (fond_planetesX< -900) {fond_planetesX = 0}
    
  // Accélération et distance parcourue:
  speed = acceleration + speed
  distanceTraveled += speed

  // Détection de collision :
  nose_x = spaceship_x + spaceship_w
  nose_y = spaceship_y + ( spaceship_h / 2 )
  for (let i = 0; i < obstacles_x.length; i++) {
    if ((nose_x >= obstacles_x[i]) && (nose_x <= obstacles_x[i] + obstacles_w[i])
        && (nose_y >= obstacles_y[i]) && (nose_y <= obstacles_y[i] + obstacles_h[i])) {
      makeGameOver()
    }
  }

  if(gameover && (millis() - gameoverTime >= 3000)) {
    resetGame()
  }
}

function switchPause() {
  if(!gameStarted || gameover) return
  if(pause) {
    // On est en pause donc on enlève la pause
    // On doit donc remettre la vitesse et l'accélération d'avant la pause
    acceleration = saved_acceleration
    speed = saved_speed
    pause = false
    userStartAudio()
  } else  {
    // Si on arrive ici, c'est qu'on est pas en pause, donc on met pause
    // On sauvegarde d'abord la vitesse et l'acceleration
    saved_speed = speed
    saved_acceleration = acceleration
    // Puis on fige le jeu
    speed = 0
    acceleration = 0
    pause = true
    userStopAudio()
  }
}
function keyPressed() {
  if (key === ' ' && gameStarted) {
    switchPause()
    return false
  }
}