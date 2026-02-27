import axios from 'axios'
import fs from 'fs'
import FormData from 'form-data'
import path from 'path'

function genserial() {
  let s = ''
  for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16)
  return s
}

async function upload(filename) {
  const form = new FormData()
  form.append('file_name', filename)

  const res = await axios.post('https://api.imgupscaler.ai/api/common/upload/upload-image',
    form,
    {
      headers: {
        ...form.getHeaders(),
        origin: 'https://imgupscaler.ai',
        referer: 'https://imgupscaler.ai/'
      }
    }
  )

  return res.data.result
}

async function uploadtoOSS(putUrl, filePath) {
  const file = fs.readFileSync(filePath)
  const type = path.extname(filePath) === '.png' ? 'image/png' : 'image/jpeg'

  const res = await axios.put(putUrl,
    file,
    {
      headers: {
        'Content-Type': type,
        'Content-Length': file.length
      },
      maxBodyLength: Infinity
    }
  )

  return res.status === 200
}

async function createJob(imageUrl, prompt) {
  const form = new FormData()
  form.append('model_name', 'magiceraser_v4')
  form.append('original_image_url', imageUrl)
  form.append('prompt', prompt)
  form.append('ratio', 'match_input_image')
  form.append('output_format', 'jpg')

  const res = await axios.post('https://api.magiceraser.org/api/magiceraser/v2/image-editor/create-job',
    form,
    {
      headers: {
        ...form.getHeaders(),
        'product-code': 'magiceraser',
        'product-serial': genserial(),
        origin: 'https://imgupscaler.ai',
        referer: 'https://imgupscaler.ai/'
      }
    }
  )

  return res.data.result.job_id
}

async function cekjob(jobId) {
  const res = await axios.get(`https://api.magiceraser.org/api/magiceraser/v1/ai-remove/get-job/${jobId}`,
    {
      headers: {
        origin: 'https://imgupscaler.ai',
        referer: 'https://imgupscaler.ai/'
      }
    }
  )

  return res.data
}

async function nanobanana(buffer, prompt) {
  
  const imagePath = `./image-${Date.now()}.jpg`
  await fs.writeFileSync(imagePath, buffer)
  const filename = path.basename(imagePath)
  const uploadd = await upload(filename)

  await uploadtoOSS(uploadd.url, imagePath)

  const cdn = 'https://cdn.imgupscaler.ai/' + uploadd.object_name
  const jobId = await createJob(cdn, prompt)
  fs.unlinkSync(imagePath)

  let result
  do {
    await new Promise(r => setTimeout(r, 3000))
    result = await cekjob(jobId)
  } while (result.code === 300006)

  return {
    job_id: jobId,
    image: result.result.output_url[0]
  }
}

let nano = async (m, {
    conn,
    text
}) => {
    try {
        let q = m.quoted ? m.quoted : m;
        const mime = (q?.msg || q?.mesaage || q?.msgs || q).mimetype
        if (!/image/.test(mime)) return m.reply("⚠️ Masukan Foto Buat Di Edit");
        m.reply("Wait... Ini mau di edit")
        const result = await nanobanana(await await q.download(), text)
        if (!result?.image) return m.reply("❌ Gomene Error Gada Result Soal Nya!")

        conn.sendMessage(m.chat, {
            image: {
                url: result?.image
            },
            caption: `✔️Done`,
            mimetype: "image/jpeg",
            fileName: "image-edit.jpg"
        }, {
            quoted: m
        })
    } catch (e) {
        m.reply(`❌ Error Reason: ${e}`)
    };
};

nano.command = nano.help = ["nanobanana", "img2img", "aiedit", "editai"];
nano.tags = ["tools"];

export default nano