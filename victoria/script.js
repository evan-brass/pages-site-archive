(function(){
  var DEBUG = false;
  (new Promise((resolve, reject) => {
    let img = new Image()
    img.addEventListener('load', () => {
      if (DEBUG) console.log(`Loaded the image`)
      resolve(img)
    })
    img.src = "../imgs/9.jpg"
  })).then((img) => {
      // Get the image's data
    	const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      if (DEBUG) {
        // document.body.appendChild(canvas)
      }
    	const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const imgData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight)
      if(DEBUG) console.log(imgData)

      // Make the dots
      const pixelsPerDot = 10
      let picPixelsPerDot

      let origin

      // Compare the aspect ratios to figure out how to scale the image.
      const imgAspect = imgData.height / imgData.width
      const windowAspect = window.innerHeight / window.innerWidth
      if(DEBUG) console.log(`(imgAspect, windowAspect) = (${imgAspect}, ${windowAspect})`)
      if (imgAspect > windowAspect) {
        // Align by height
        picPixelsPerDot = (pixelsPerDot / window.innerHeight) * imgData.height
        origin = {
          x: Math.floor((window.innerWidth * (imgData.height / window.innerHeight) - imgData.width) / 2),
          y: 0
        }
      } else {
        // Align by width
        picPixelsPerDot = (pixelsPerDot / window.innerWidth) * imgData.width
        origin = {
          x: 0,
          y: Math.floor((window.innerHeight * (imgData.width / window.innerWidth) - imgData.height) / 2)
        }
      }
      if(DEBUG) console.log("Origin: ", origin)

      const numRows = Math.floor(window.innerHeight / pixelsPerDot)
      const numColumns = Math.floor(window.innerWidth / pixelsPerDot)

      const container = document.createElement('div')

      const offsetWidth = (window.innerWidth % pixelsPerDot)/2
      const offsetHeight = (window.innerHeight % pixelsPerDot)/2
      if(DEBUG) console.log(`The offsets: (${offsetWidth}, ${offsetHeight})`)

      let picX = origin.x, picY = origin.y

      for (let row = 0; row < numRows; ++row) {
        for (let column = 0; column < numColumns; ++column) {
          let dot = document.createElement('div')
          dot.className = "dot"
          dot.style.left = pixelsPerDot * column + offsetWidth + "px"
          dot.style.top = pixelsPerDot * row + offsetHeight + "px"

          let r, g, b, a = 1
          if (picX < 0 || picX > imgData.width || picY < 0 || picY > imgData.height) {
            if (DEBUG) {
              r = 255, g = 0, b = 0
            } else {
              r = 238, g = 238, b = 238 // #eee
              r = 51, g = 51, b = 51 // #333
              // r = 0, g = 0, b = 0 // #000
            }
          } else {
            let loc = ((imgData.width * picY) + picX) * 4 // Apparently the img data has transparency information! Who knew?
            r = imgData.data[loc]
            g = imgData.data[loc + 1]
            b = imgData.data[loc + 2]
            if(DEBUG) console.log(loc, imgData.data[loc], imgData.data[loc+1], imgData.data[loc+2])
          }

          // Move to the next dot
          picX = Math.floor(picX + picPixelsPerDot)

          dot.style.background = `rgba(${r},${g},${b}, ${a})`
          container.appendChild(dot)
        }
        picY = Math.floor(picY + picPixelsPerDot)
        picX = origin.x
      }
      document.body.appendChild(container)
  })
})()
