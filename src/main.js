const {ipcRenderer} = require("electron")
const path = require("path")
const fs = require("fs")

let setActiveTrack = (track, artist, isPaused, art, time) => {
  ipcRenderer.send("set-track", {track, artist, isPaused, art, time})
}

let createStyle = (filepath, parent) => {
  let style = document.createElement("style")
  style.type = "text/css"
  style.innerHTML = fs.readFileSync(path.join(__dirname, "../assets/", filepath))
  parent.appendChild(style)
}

window.onload = () => {

  let playerFrameDocument = () => {
    return document.getElementById("app-player").contentWindow.document
  }

  createStyle("styles/main.css", document.head)


  setInterval(() => {
    try {
      let track = playerFrameDocument().getElementById("track-name").getElementsByTagName("a")[0].innerHTML
      let artist = playerFrameDocument().getElementById("track-artist").getElementsByTagName("a")[0].innerHTML
      let isPaused = !playerFrameDocument().getElementById("play-pause").classList.contains("playing")
      let art = playerFrameDocument().getElementById("cover-art").getElementsByClassName("sp-image-img")[0].style["background-image"].match(/\"(.*)\"/)[1]

      let length = playerFrameDocument().getElementById("track-length").innerHTML.split(':')
      let seconds = (parseInt(length[0]) * 60) + parseInt(length[1])
      setActiveTrack(track, artist, isPaused, art, seconds)
    } catch (e) {}

  }, 1E3)

  ipcRenderer.on("play", () => {
    playerFrameDocument().getElementById("play-pause").click()
  })

  ipcRenderer.on("pause", () => {
    playerFrameDocument().getElementById("play-pause").click()
  })

  ipcRenderer.on("next", () => {
    playerFrameDocument().getElementById("next").click()
  })

  ipcRenderer.on("prev", () => {
    playerFrameDocument().getElementById("previous").click()
  })

}
