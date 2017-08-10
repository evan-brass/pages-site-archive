const PRESETS = {
  backgroundColor: "#000000",
  examples: [
    {name: "niagara2.jpg", url: "examples/niagara2.jpg"},
    {name: "niagara1.jpg", url: "examples/niagara1.jpg"},
    {name: "grass.jpg", url: "examples/grass.jpg"},
    {name: "flower1.jpg", url: "examples/flower1.jpg"},
    {name: "flower2.jpg", url: "examples/flower2.jpg"},
    {name: "flower3.jpg", url: "examples/flower3.jpg"},
    {name: "flower4.jpg", url: "examples/flower4.jpg"},
    {name: "flower5.jpg", url: "examples/flower5.jpg"},
    {name: "koi.jpg", url: "examples/koi.jpg"},
  ],
  fill: 1,
  spacing: 70,
  maxSpacing: 200,
  minSpacing: 3,
  maxFill: 1,
  minFill: .05
}

class Dotty {
  constructor(options = {}) {
    this.options = Object.assign(options, PRESETS)
    this.CreateMenu()
    this.CreateCanvas()
  }
  CreateCanvas() {
    this.container = document.createElement('div')
    this.canvas = document.createElement('canvas')
    this.container.id = "Dotty"

    this.container.appendChild(this.canvas)
    document.body.appendChild(this.container)
    this.context = this.canvas.getContext('2d')
  }
  CreateMenu() {
    this.menu = {}
    this.menu.root = document.createElement('form')
    this.menu.root.id = "Menu"
    this.menu.root.innerHTML =
`
<h2>Notes:</h2>
<ol style="max-width: 200px;text-align: left;">
  <li>Sorry for the initial delay with all of the example images, they are higher resolution then they needed to be.  <small>Also sorry that there's no progress bar</small></li>
  <li>Uploading your own pictures will work much faster.</li>
  <li>I shouldn't have said uploading because your pictures will never leave your browser and no one can see them.</li>
  <li>You can save your image by right clicking the image and selecting "save as" while I get the download link working.</li>
  <li>Thanks for checking it out!</li>
  <small><li>Sorry it's not mobile friendly.</li></small>
</ol>
<hr />
<h2>Background Color:</h2>
<input type="color" name="background" value="${this.options.backgroundColor}"/>
<hr />
<h2>Image:</h2>
<select name="target" size="${this.options.examples.length + 3}">
  ${this.options.examples.map(example => `<option value="${example.url}">${example.name}</option>`).join("")}
</select><br />
<input type="file" name="add-image" multiple="true" accept="image/*"/>
<hr />
<h2>Fill:</h2>
${this.options.minFill*100}%<input type="range" name="fill" min="${this.options.minFill}" max="${this.options.maxFill}" step=".01" value="${this.options.fill}"/>${this.options.maxFill*100}%
<h2>Spacing:</h2>
${this.options.minSpacing}px<input type="range" name="spacing" min="${this.options.minSpacing}" max="${this.options.maxSpacing}" step="2" value="${this.options.spacing}"/>${this.options.maxSpacing}px<br />
<hr />
<h2>Download:</h2>
<div>Doesn't work yet</div>
<button name="createDownload" type="button" disabled>Create Download Link</button>
`
    // Make our menu active
    this.menu.background = this.menu.root.querySelector('[name="background"]')
    this.menu.background.addEventListener("change", this.ParseMenu.bind(this))

    this.menu.target = this.menu.root.querySelector('[name="target"]')
    this.menu.target.addEventListener("change", this.ParseMenu.bind(this))
      // Select the first uploaded picture
    this.menu.target.options[0].selected = true

    this.menu.addImage = this.menu.root.querySelector('[name="add-image"]')
    this.menu.addImage.addEventListener("change", this.ParseMenu.bind(this))

    this.menu.fill = this.menu.root.querySelector('[name="fill"]')
    this.menu.fill.addEventListener("change", this.ParseMenu.bind(this))

    this.menu.spacing = this.menu.root.querySelector('[name="spacing"]')
    this.menu.spacing.addEventListener("change", this.ParseMenu.bind(this))

    this.menu.createDownload = this.menu.root.querySelector('button')
    this.menu.createDownload.addEventListener("click", this.CreateDownloadLink.bind(this))

    this.ParseMenu()
    document.body.appendChild(this.menu.root)
  }
  ParseMenu() {
    // Remove any (no obsolete) download link
    let downloadLink = this.menu.root.querySelector("#download-link")
    if (downloadLink) {
      downloadLink.remove()
    }

    // Set the background color
    if (this.menu.background.value) {
      this.options.backgroundColor = this.menu.background.value
    }
    document.body.style.backgroundColor =  this.options.backgroundColor

    // Add any new files
    let currentUploads = Array.from(this.menu.target.options).map(opt => opt.innerText)
    for (let file of Array.from(this.menu.addImage.files)) {
      if (!currentUploads.includes(file.name)) {
        let newPossibleTarget = document.createElement('option')
        newPossibleTarget.value = URL.createObjectURL(file)
        newPossibleTarget.innerText = file.name
        this.menu.target.add(newPossibleTarget)

        // Clear the file input
        this.menu.addImage.value = ""
      }
    }

    // Other drawing options
    if (this.menu.fill.value) this.options.fill = this.menu.fill.value
    if (this.menu.spacing.value) this.options.spacing = this.menu.spacing.value

    // Update the display with the current file
    this.Update(this.menu.target.value)
  }
  static ColorAt(imgData, x, y) {
    let index = (imgData.width * y + x) * 4
    return [imgData.data[index], imgData.data[index+1], imgData.data[index+2]]
  }
  CreateDownloadLink() {
    this.menu.root.innerHTML +=
`<a href="${URL.createObjectURL(this.canvas)}" id="download-link" download="true">Click me to Download</a>`
  }
  Update(url) {
    let image = new Image()
    image.addEventListener("load", () => {
      // Get the image's data
      this.canvas.width = image.width
      this.canvas.height = image.height
      this.context.drawImage(image, 0, 0)
      let imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
      console.log(imageData)

      // Clear the Canvas (with the background color)
      this.context.fillStyle = this.options.backgroundColor
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

      // Draw the dots
      let columns = Math.floor(imageData.width / this.options.spacing)
      let rows = Math.floor(imageData.height / this.options.spacing)
      let radius = Math.floor(this.options.fill * this.options.spacing / 2)
      let extraX = imageData.width % this.options.spacing / 2
      let extraY = imageData.height % this.options.spacing / 2
      for (let r = 0; r < rows; ++r) {
        for (let c = 0; c < columns; ++c) {
          // Get the color
          let x = this.options.spacing * c + radius
          let y = this.canvas.height - (this.options.spacing * r + radius)
          let [red, green, blue] = Dotty.ColorAt(imageData, x, y)

          // Actually draw the circle
          this.context.fillStyle = "rgb(" + red + ", " + green + ", " + blue + ")"
//          console.log(this.context.fillStyle)
          this.context.moveTo(x, y)
          this.context.beginPath()
          this.context.arc(x + extraX, y - extraY, radius, 0, 2 * Math.PI)
          this.context.closePath()
          this.context.fill()
        }
      }
    })
    image.src = url
  }
}

const dotty = new Dotty()
