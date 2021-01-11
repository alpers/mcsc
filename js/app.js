"use strict";

class App {
  constructor () {
    this.btnRecord = document.getElementById('btn-record');
    this.btnStop = document.getElementById('btn-stop');
    this.btnSave = document.getElementById('btn-save');

    this.debugTxt = document.getElementById('debug-txt')

    this.recordingsCont = document.getElementById('recordings-cont')

    this.isRecording = false
    this.saveNextRecording = false

    this.debugTxt.innerHTML = ""

    this.meterAvgElement = document.getElementById('recording-meter-avg')
    this.meterValueElement = document.getElementById('recording-meter-value')
    this.maxPeakValue = 0
    this.avgPeakValue = 0
  }

  init () {
    this._initEventListeners()
  }

  _initEventListeners () {

    this.btnRecord.addEventListener('click', evt => {
      this._stopAllRecording()
      this.saveNextRecording = true
      this._startRecording()

      this.btnRecord.disabled = true
      this.btnStop.disabled = false
      this.btnSave.disabled = true
      this.debugTxt.innerHTML = "started"
    })

    this.btnStop.addEventListener('click', evt => {
      this._stopAllRecording();

      this.btnRecord.disabled = false
      this.btnStop.disabled = true
      this.btnSave.disabled = false
      this.debugTxt.innerHTML = "stopped"
    })
  }

  _startRecording () {
    if (!this.recorderSrvc) {
      this.recorderSrvc = new RecorderService()
      this.recorderSrvc.em.addEventListener('recording', (evt) => this._onNewRecording(evt))
    }

    if (!this.webAudioPeakMeter) {
      this.webAudioPeakMeter = new WebAudioPeakMeter()
      this.meterEl = document.getElementById('recording-meter')
      document.getElementById('recording-meter').innerHTML = ''
    }

    this.recorderSrvc.onGraphSetupWithInputStream = (inputStreamNode) => {
      this.meterNodeRaw = this.webAudioPeakMeter.createMeterNode(inputStreamNode, this.recorderSrvc.audioCtx)
      this.webAudioPeakMeter.createMeter(this.meterEl, this.meterNodeRaw, {})
    }

    this.recorderSrvc.startRecording()
    this.isRecording = true
    this.debugTxt.innerHTML = "recording..."
  }

  _stopAllRecording () {
    if (this.recorderSrvc && this.isRecording) {

      this.recorderSrvc.stopRecording()
      this.isRecording = false

      if (this.meterNodeRaw) {
        this.maxPeakValue = Math.max(this.webAudioPeakMeter.channelPeakLabels[0].textContent, this.webAudioPeakMeter.channelPeakLabels[1].textContent)
        this.avgPeakValue = getAvg(this.webAudioPeakMeter.channelAllPeakLabels)
        this.meterValueElement.innerHTML = this.avgPeakValue + ''
        this.meterAvgElement.innerHTML =  'Max Peak Value: ' + this.maxPeakValue + '<br />' + 'Average Peak Value: ' + this.avgPeakValue 
        this.meterNodeRaw.disconnect()
        this.meterNodeRaw = null
        this.meterEl.innerHTML = ''
        this.webAudioPeakMeter.channelAllPeakLabels = []
      }
    }
  }

  _onNewRecording (evt) {
    if (!this.saveNextRecording) {
      return
    }
    //const newIdx = this.recordingsCont.childNodes.length + 1
    //const newEl = document.createElement('div')
    //newEl.innerHTML = '<audio id="audio-recording-' + newIdx + '" controls></audio>'
    //this.recordingsCont.appendChild(newEl)
    //const recordingEl = document.getElementById("audio-recording-" + newIdx);
    //recordingEl.src = evt.detail.recording.blobUrl
    //recordingEl.type = evt.detail.recording.mimeType
  }
}
function getAvg(peaks){
  var total = 0;
  for(var i = 0; i < peaks.length; i++) {
      total += peaks[i];
  }
  return (total / peaks.length).toFixed(2);
}
