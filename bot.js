const url = require('url')
const exec = require('child_process').exec
const Discord = require('discord.js');
const YoutubeMp3Downloader = require("youtube-mp3-downloader");
const client = new Discord.Client()
const YD = new YoutubeMp3Downloader({
  'outputPath': 'temp/',
  'youtubeVideoQuality': 'highest',
  'queueParallelism': 2,
  'progressTimeout': 2000
})
let dispatcher = null

YD.on('error', (error) => {
  console.log(error)
})

YD.on('progress', (progress) => {
  console.log(JSON.stringify(progress))
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`)
})

client.on('message', msg => {
  if (msg.content.startsWith(`>>play https://www.youtube.com/`)) {
    const q = url.parse(msg.content, true)
    const videoId = q.search.split('&')[0].substring(3)
    YD.download(videoId, 'temp.mp3')

    YD.on('finished', (err, data) => {
      exec(
        'sox -N -V1 temp/temp.mp3 -C 320 -r 44100 -b 24 -c 2 temp/temp2.mp3 reverb 50 50 100 100 0 speed 0.75',
        (error, stdout, stderr) => {
          console.log(error, stdout, stderr)

          const voiceChannel = msg.member.voice.channel
          voiceChannel.join().then(connection => {
            dispatcher = connection.play('temp/temp2.mp3')
            dispatcher.on('end', end => voiceChannel.leave())
          })
        }
      )
    })
  }
  else if (msg.content === '>>stop') {
    dispatcher.end()
  }
})

// Get bot token from command line
client.login(process.argv[2])