let gameStarted = false
let musicTracks = []
let currentMusicIndex = -1
let musicPlaybackId = 0

// Cette fonction est exécutée une seule fois
async function setup() {
  const canvas = createCanvas(900, 600);
  canvas.parent('game-container')
  vaisseau = await loadImage('vaisseau.png');
  obstacle = await loadImage('obstacle_3_reacteur_energetique.png');
  pause_img = await loadImage('pause.png')
  fond_etoiles= await loadImage('01_etoiles.png')
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
  speed_origine = 2.3;
  acceleration_origine = 0.001;
  speed = speed_origine;
  acceleration = acceleration_origine;
  
  pause = false
  gameover = false
  gameoverTime = 0

  spaceship_x = 10
  spaceship_y = 150
  spaceship_w = 190
  spaceship_h = 100
 
  fond_etoilesX=0
  fond_etoilesX2=600
  fond_planetesX=0

  obstacleX=370
  obstacleX2=800
  obstacleY=300
  obstacleY2=0
  obstacle_w = 100
  obstacle_h = 300

  switchMusic()
}

function makeGameOver() {
  if(gameover) return
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
  image(fond_planetes,fond_planetesX,0,900,600)
  image(fond_planetes,fond_planetesX+900,0,900,600)
  
  // Dessin des sprites
  image(vaisseau, spaceship_x, spaceship_y, spaceship_w, spaceship_h);
  image(obstacle,obstacleX,obstacleY,obstacle_w,obstacle_h)
  image(obstacle,obstacleX2,obstacleY2,obstacle_w,obstacle_h)
  if(pause) {
    displayPause()
  }
  if(gameover) {
    displayGameOver()
  }
  
  // Coordonnées des obstacles :
  obstacleX = obstacleX - speed
  obstacleX2 = obstacleX2 - speed
  if(obstacleX < -100) {
    obstacleX = 900
    if(obstacleY2 == 0) {
      pos_autorisee_1 = 150
      pos_autorisee_2 = 300
    }
    if(obstacleY2 == 150) {
      pos_autorisee_1 = 0
      pos_autorisee_2 = 300
    }
    if(obstacleY2 == 300) {
      pos_autorisee_1 = 0
      pos_autorisee_2 = 150
    }
    if(Math.random() < 0.5) {
      obstacleY = pos_autorisee_1
    } else {
      obstacleY = pos_autorisee_2
    }    
  }
  if(obstacleX2 < -100) {
    obstacleX2 = 900
    if(obstacleY == 0) {
      pos_autorisee_1 = 150
      pos_autorisee_2 = 300
    }
    if(obstacleY == 150) {
      pos_autorisee_1 = 0
      pos_autorisee_2 = 300
    }
    if(obstacleY == 300) {
      pos_autorisee_1 = 0
      pos_autorisee_2 = 150
    }
    if(Math.random() < 0.5) {
      obstacleY2 = pos_autorisee_1
    } else {
      obstacleY2 = pos_autorisee_2
    }
  }

  // Parallaxes :
  fond_etoilesX=fond_etoilesX-speed/5
  if (fond_etoilesX< -900) {fond_etoilesX = 0}
  fond_planetesX=fond_planetesX-speed/2
  if (fond_planetesX< -900) {fond_planetesX = 0}
    
  // Accélération :
  speed=acceleration + speed

  // Détection de collision :
  nose_x = spaceship_x + spaceship_w
  nose_y = spaceship_y + ( spaceship_h / 2 )
  if( (nose_x >= obstacleX ) && ( nose_x <= obstacleX + obstacle_w )
      && 
      (nose_y >= obstacleY ) && (nose_y <= obstacleY + obstacle_h)
  ) {
    makeGameOver()
  }
  nose_x = spaceship_x + spaceship_w
  nose_y = spaceship_y + ( spaceship_h / 2 )
  if( (nose_x >= obstacleX2 ) && ( nose_x <= obstacleX2 + obstacle_w )
      && 
      (nose_y >= obstacleY2 ) && (nose_y <= obstacleY2 + obstacle_h)
  ) {
    makeGameOver()
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