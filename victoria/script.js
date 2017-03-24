(function(){
  (new Promise((resolve, reject) => {
    let img = new Image()
    img.addEventListener('load', () => {
      console.log(`Loaded the image`)
      resolve(img)
    })
    img.src = "../imgs/1.jpg"
  })).then((img) => {
    	const canvas = document.createElement('canvas')
    	const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const imgData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight)
      console.log(imgData)
  })
})()
