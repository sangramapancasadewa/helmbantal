const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require("@adiwajshing/baileys");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const { Configuration, OpenAIApi } = require("openai");
const { exec, spawn, execSync } = require("child_process")
const moment = require("moment-timezone");
const { makeid, runtime } = require("./function/func_Server");
const { db_user_JSON } = require('./function/Data_Location.js')
const msgFilter = require("./function/func_Spam");
let setting = require("./key.json");
let orang_spam = []

const db_user = db_user_JSON

const cekUser = (satu, dua) => {
  let x1 = false;
  Object.keys(db_user).forEach((i) => {
    if (db_user[i].id == dua) {
      x1 = i;
    }
  });
  if (x1 !== false) {
    if (satu == "id") {
      return db_user[x1].id;
    }
    if (satu == "name") {
      return db_user[x1].name;
    }
    if (satu == "seri") {
      return db_user[x1].seri;
    }
    if (satu == "premium") {
      return db_user[x1].premium;
    }
  }
  if (x1 == false) {
    return null;
  }
};

moment.tz.setDefault("Asia/Jakarta").locale("id");
module.exports = sansekai = async (client, m, chatUpdate, store) => {
  try {
    var body =
      m.mtype === "conversation"
        ? m.message.conversation
        : m.mtype == "imageMessage"
        ? m.message.imageMessage.caption
        : m.mtype == "videoMessage"
        ? m.message.videoMessage.caption
        : m.mtype == "extendedTextMessage"
        ? m.message.extendedTextMessage.text
        : m.mtype == "buttonsResponseMessage"
        ? m.message.buttonsResponseMessage.selectedButtonId
        : m.mtype == "listResponseMessage"
        ? m.message.listResponseMessage.singleSelectReply.selectedRowId
        : m.mtype == "templateButtonReplyMessage"
        ? m.message.templateButtonReplyMessage.selectedId
        : m.mtype === "messageContextInfo"
        ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text
        : "";
    var budy = typeof m.text == "string" ? m.text : "";
    // var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/"
    var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/";
    const isCmd2 = body.startsWith(prefix);
    const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
    const isCommand = body.startsWith(prefix);
    const isCmd = isCommand ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : null;
    const args = body.trim().split(/ +/).slice(1);
    const pushname = m.pushName || "No Name";
    const botNumber = await client.decodeJid(client.user.id);
    const isGroup = m.key.remoteJid.endsWith('@g.us')
    const sender = m.sender;
    const isOwner = setting.ownerNumber == m.sender ? true : ["6289519318271@s.whatsapp.net"].includes(m.sender) ? true : false;
    const isPremium = isOwner || cekUser("premium", sender) == true;
    const itsMe = m.sender == botNumber ? true : false;
    let text = (q = args.join(" "));
    const arg = budy.trim().substring(budy.indexOf(" ") + 1);
    const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);

    const from = m.chat;
    const reply = m.reply;
    const mek = chatUpdate.messages[0];

    const color = (text, color) => {
      return !color ? chalk.green(text) : chalk.keyword(color)(text);
    };

    // Group
    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch((e) => {}) : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";

    // Push Message To Console
    let argsLog = budy.length > 30 ? `${q.substring(0, 30)}...` : budy;
    
    function mentions(teks, mems = [], id) {
if (id == null || id == undefined || id == false) {
let res = client.sendMessage(from, { text: teks, mentions: mems })
return res
} else {
let res = client.sendMessage(from, { text: teks, mentions: mems }, { quoted: msg })
return res
}
}   

let setUser = (satu, dua, tiga) => { 
Object.keys(db_user).forEach((i) => {
if (db_user[i].id == dua){
if (satu == "±id"){ db_user[i].id = tiga
fs.writeFileSync('./database/pengguna.json', JSON.stringify(db_user))} 
if (satu == "±name"){ db_user[i].name = tiga 
fs.writeFileSync('./database/pengguna.json', JSON.stringify(db_user))} 
if (satu == "±seri"){ db_user[i].seri = tiga 
fs.writeFileSync('./database/pengguna.json', JSON.stringify(db_user))} 
if (satu == "±premium"){ db_user[i].premium = tiga 
fs.writeFileSync('./database/pengguna.json', JSON.stringify(db_user))}
}})
}

msgFilter.ResetSpam(orang_spam)

const spampm = () => {
console.log(color('~>[SPAM]', 'red'), color(moment(m.messageTimestamp * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
msgFilter.addSpam(sender, orang_spam)
reply('Kamu terdeteksi spam bot tanpa jeda, lakukan perintah setelah 5 detik')
}

const spamgr = () => {
console.log(color('~>[SPAM]', 'red'), color(moment(m.messageTimestamp * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(groupName))
msgFilter.addSpam(sender, orang_spam)
reply('Kamu terdeteksi spam bot tanpa jeda, lakukan perintah setelah 5 detik')
}

if (isCmd && msgFilter.isFiltered(sender) && !isGroup) return spampm()
if (isCmd && msgFilter.isFiltered(sender) && isGroup) return spamgr()
if (isCmd && args.length < 1 && !isOwner) msgFilter.addFilter(sender)

    if (isCmd2 && !m.isGroup) {
      console.log(chalk.black(chalk.bgWhite("[ LOGS ]")), color(argsLog, "turquoise"), chalk.magenta("From"), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`));
    } else if (isCmd2 && m.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`),
        chalk.blueBright("IN"),
        chalk.green(groupName)
      );
    }
    
        // Reset Limit
    let cron = require("node-cron");
    cron.schedule(
      "00 12 * * *",
      () => {
        let user = Object.keys(db_user);
        for (let jid of user) db_user[jid].limit = 20;
        fs.writeFileSync("./database/pengguna.json", JSON.stringify(db_user));
        console.log("Reseted Limit");
      },
      {
        scheduled: true,
        timezone: "Asia/Jakarta",
      }
    );
    
        const confirmlimit = (sender, amount) => {
      if (isPremium) {
        return false;
      }
      let position = false;
      Object.keys(db_user).forEach((i) => {
        if (db_user[i].id == sender) {
          position = i;
        }
      });
      if (position !== false) {
        db_user[position].limit -= amount;
        fs.writeFileSync("./database/pengguna.json", JSON.stringify(db_user));
      }
    };

    const checklimitUser = (sender) => {
      let position = false;
      Object.keys(db_user).forEach((i) => {
        if (db_user[i].id === sender) {
          position = i;
        }
      });
      if (position !== false) {
        return db_user[position].limit;
      }
    };
    
     const limitabis = `*[LIMIT KAMU HABIS]*\nBeli limit di *.creator* atau beli premium untuk mendapatkan unlimited limit, atau bisa menunggu direset kembali pada jam 00:00`;

    if (isCmd2) {
      switch (command) {
      case 'verify':{
if (cekUser("id", sender) !== null) return reply('Kamu sudah terdaftar !!')
var res_us = `${makeid(10)}`
var user_name = `#GR${makeid(5)}`
let limit = 20;
          let object_user = {
            id: sender,
            name: user_name,
            seri: res_us,
            limit: limit,
            premium: false,
          };
          db_user.push(object_user);
          fs.writeFileSync(
            "./database/pengguna.json",
            JSON.stringify(db_user, 2, null)
          );
mentions(`𝖬𝖾𝗆𝗎𝖺𝗍 𝖴𝗌𝖾𝗋 @${sender.split("@")[0]}`, [sender])
m.reply(` *TERVERIFIKASI*\n○ ID : @${sender.split('@')[0]} \n○ Name : ${user_name} \n○ Seri : ${res_us} \n○ Limit : ${limit} \nsilahkan ketik ${prefix}menu\nuntuk menggunakan bot`)
}
        break;
        case "infoprofil":
        let namenya = `${cekUser("name", sender)}`;
          let premnya = `${cekUser("premium", sender) ? "Aktif" : "Tidak"}`;
          let limitnya = `${
            isPremium ? "UNLIMITED" : `${checklimitUser(sender)}`
          }`;
          m.reply(` 𝗨𝗦𝗘𝗥 𝗜𝗡𝗙𝗢
 ● ID : @${sender.split("@")[0]}
 ● Code : ${namenya}
 ● Premium : ${premnya}
 ● Limit : ${limitnya} `)
        break;
        case "help":
        case "menu":
          if (cekUser("id", sender) == null) return reply('Kamu belum terdaftar didatabase XyugarBot silahkan ketik #verify');
          m.reply(`*XyugarBot*
            
*(GPT4)*
${prefix}ai 
_Tanyakan apa saja kepada AI_
${prefix}img
_Membuat gambar dari teks_

*(MAGER)*
${prefix}nulis (text)
_Menulis dibuku menggunakan bot_

*(INFO)*
${prefix}infoprofil
_Untuk Mengecek Profil Kamu Didatabase_
${prefix}infobot
_Informasi Keseluruhan Bot_
${prefix}creator
_Pembuat Bot_


*(OWNER)*
${prefix}addprem 62×××××××××
${prefix}delprem 62×××××××××`)
          break;       
        case "ai": case "openai":
         if (cekUser("id", sender) == null) return reply('Kamu belum terdaftar didatabase XyugarBot silahkan ketik #verify');
         if (checklimitUser(sender) <= 0) return reply(limitabis);
          try {
            if (setting.keyopenai === "ISI_APIKEY_OPENAI_DISINI") return reply("Apikey belum diisi\n\nSilahkan isi terlebih dahulu apikeynya di file key.json\n\nApikeynya bisa dibuat di website: https://beta.openai.com/account/api-keys");
            if (!text) return reply(`Chat dengan AI.\n\nContoh:\n${prefix}${command} Apa itu resesi`);
            const configuration = new Configuration({
              apiKey: setting.keyopenai,
            });
            const openai = new OpenAIApi(configuration);

            /*const response = await openai.createCompletion({
              model: "text-davinci-003",
              prompt: text,
              temperature: 0, // Higher values means the model will take more risks.
              max_tokens: 2048, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
              top_p: 1, // alternative to sampling with temperature, called nucleus sampling
              frequency_penalty: 0.3, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
              presence_penalty: 0 // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
          });
            m.reply(`${response.data.choices[0].text}`);*/
            const response = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{role: "user", content: text}],
          });
          m.reply(`${response.data.choices[0].message.content}`);
          } catch (error) {
          if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
            console.log(`${error.response.status}\n\n${error.response.data}`);
          } else {
            console.log(error);
            m.reply("Maaf, sepertinya ada yang error :"+ error.message);
          }
        }
          confirmlimit(sender, 1);
          break;
        case "img": case "ai-img": case "image": case "images":
         if (cekUser("id", sender) == null) return reply('Kamu belum terdaftar didatabase XyugarBot silahkan ketik #verify');
         if (checklimitUser(sender) <= 0) return reply(limitabis);
          try {
            if (setting.keyopenai === "ISI_APIKEY_OPENAI_DISINI") return reply("Apikey belum diisi\n\nSilahkan isi terlebih dahulu apikeynya di file key.json\n\nApikeynya bisa dibuat di website: https://beta.openai.com/account/api-keys");
            if (!text) return reply(`Membuat gambar dari AI.\n\nContoh:\n${prefix}${command} Wooden house on snow mountain`);
            const configuration = new Configuration({
              apiKey: setting.keyopenai,
            });
            const openai = new OpenAIApi(configuration);
            const response = await openai.createImage({
              prompt: text,
              n: 1,
              size: "512x512",
            });
            //console.log(response.data.data[0].url)
            client.sendImage(from, response.data.data[0].url, text, mek);
            } catch (error) {
          if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
            console.log(`${error.response.status}\n\n${error.response.data}`);
          } else {
            console.log(error);
            m.reply("Maaf, sepertinya ada yang error :"+ error.message);
          }
        }
          confirmlimit(sender, 1);
          break;
          case "addprem":
        {
          if (!isOwner) return reply(`Maaf Fitur Ini Khusus Owner Kak`);
          if (!q) return reply("*Contoh:*\n#addprem 628xxx");
          var number_one = q + "@s.whatsapp.net";
          if (cekUser("id", number_one) == null)
            return reply("User tersebut tidak terdaftar di database");
          if (cekUser("premium", number_one) == true)
            return reply("User tersebut sudah premium");
          setUser("±premium", number_one, true);
          reply(
            `*PREMIUM*\n*ID:* @${number_one.split("@")[0]}\n*Status:* aktif`
          );
        }
        break;
      case "delprem":
        {
          if (!isOwner) return reply(`Maaf Fitur Ini Khusus Owner Kak`);
          if (!q) return reply("*Contoh:*\n#delprem 628xxx");
          var number_one = q + "@s.whatsapp.net";
          if (cekUser("id", number_one) == null)
            return reply("User tersebut tidak terdaftar di database");
          if (cekUser("premium", number_one) == false)
            return reply("User tersebut tidak premium");
          setUser("±premium", number_one, false);
          reply(
            `*PREMIUM*\n*ID:* @${number_one.split("@")[0]}\n*Status:* tidak`
          );
        }
        break;
            case 'nulis':
                     if (cekUser("id", sender) == null) return reply('Kamu belum terdaftar didatabase XyugarBot silahkan ketik #verify');
            if (!isOwner) return reply(`maaf fitur ini khusus premium`);
             m.reply(`Terjadi kesalahan\nDalam: _env.processConvert_`)
            break;
            case 'creator':
            if (cekUser("id", sender) == null) return reply('Kamu belum terdaftar didatabase XyugarBot silahkan ketik #verify');
            m.reply(`──「 *INFO OWNER* 」──

 *Data Profil*
 • *Nama:* Sangrama
 • *Umur:* 17 tahun
 • *Hoby:* Menggambar
 • *Askot:* Jateng

_bukan programmer apalagi hengker._

 *Sosial Media*
 • *Whatsapp:* wa.me/6289519318271
 • *Youtube:* youtube.com/@xyugarsars1652
 • *Instagram:* instagram.com/sangrama.panca`)
 break;
       case "infobot":
         if (cekUser("id", sender) == null) return reply('Kamu belum terdaftar didatabase XyugarBot silahkan ketik #verify');
        reply(`*Namebot :* _Xyugarbot_\n*Runtime :* ${runtime(process.uptime())}\n*Library :* _Baileys_\n*Javascript :* _Nodejs_\n*Deploy it :* _Panel pterodactyl_\n*Monitoring :* _uptimerobot_`);
        break;
        default: {
          if (isCmd2 && budy.toLowerCase() != undefined) {
            if (m.chat.endsWith("broadcast")) return;
            if (m.isBaileys) return;
            if (!budy.toLowerCase()) return;
            if (argsLog || (isCmd2 && !m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("tidak tersedia", "turquoise"));
            } else if (argsLog || (isCmd2 && m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("tidak tersedia", "turquoise"));
            }
          }
        }
      }
    }
  } catch (err) {
    m.reply(util.format(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
