const Hud = (() => {
  let graphics
  let lastText = null
  const palette = [
    [6, 20, 40, 220],
    [65, 220, 255, 255],
    [190, 245, 255, 255]
  ]

  function setup() {
    graphics = createGraphics(210, 27)
    graphics.pixelDensity(1)
  }

  function draw(speed, savedSpeed, isPaused, isGameOver, distanceTraveled) {
    const displayedSpeed = isPaused || isGameOver ? savedSpeed : speed
    const text = `speed: ${(displayedSpeed / 2.3).toFixed(1)}  distance: ${Math.floor(distanceTraveled / 100)}`
    if(text !== lastText) {
      graphics.clear()
      graphics.noStroke()
      graphics.fill(6, 20, 40, 220)
      graphics.rect(0, 0, graphics.width, graphics.height)
      graphics.stroke(65, 220, 255)
      graphics.strokeWeight(1)
      graphics.noFill()
      graphics.rect(0.5, 0.5, graphics.width - 1, graphics.height - 1)
      graphics.noStroke()
      graphics.fill(190, 245, 255)
      graphics.textFont('monospace')
      graphics.textStyle(BOLD)
      graphics.textSize(12)
      graphics.textAlign(RIGHT, TOP)
      graphics.text(text, graphics.width - 6, 6)
      graphics.loadPixels()
      for(let i = 0; i < graphics.pixels.length; i += 4) {
        if(graphics.pixels[i + 3] === 0) continue
        let nearestColor = palette[0]
        let nearestDistance = Infinity
        for(const color of palette) {
          const redDiff = graphics.pixels[i] - color[0]
          const greenDiff = graphics.pixels[i + 1] - color[1]
          const blueDiff = graphics.pixels[i + 2] - color[2]
          const colorDistance = redDiff * redDiff + greenDiff * greenDiff + blueDiff * blueDiff
          if(colorDistance < nearestDistance) {
            nearestColor = color
            nearestDistance = colorDistance
          }
        }
        graphics.pixels[i] = nearestColor[0]
        graphics.pixels[i + 1] = nearestColor[1]
        graphics.pixels[i + 2] = nearestColor[2]
        graphics.pixels[i + 3] = nearestColor[3]
      }
      graphics.updatePixels()
      lastText = text
    }

    push()
    drawingContext.imageSmoothingEnabled = false
    image(graphics, width - graphics.width * 2 - 20, 10, graphics.width * 2, graphics.height * 2)
    pop()
  }

  return { setup, draw }
})()
