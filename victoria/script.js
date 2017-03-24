(function(){
  (new Promise((resolve, reject) => {
    let img = new Image()
    img.addEventListener('load', () => {
      console.log(`Loaded the image`)
      resolve(img)
    })
    img.src = "../imgs/1.jpg"
  })).then((img) => {
      // Get the image's data
    	const canvas = document.createElement('canvas')
    	const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const imgData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight)
      console.log(imgData)

      // Make the dots
      const pixelsPerDot = 40
      const numRows = screen.height / pixelsPerDot
      const numColumns = screen.width / pixelsPerDot

      const container = document.createElement('div')
      for (let row = 0; row < numRows; ++row) {
        for (let column = 0; column < numColumns; ++column) {
          let dot = document.createElement('div')
          dot.className = "dot"
          container.appendChild(dot)
        }
      }
      document.body.appendChild(container)
  })
})()
