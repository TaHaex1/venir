const http = require("http");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("VenirMc Bot aktif.");
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Web port aktif: ${PORT}`);
});

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  Partials,
  MessageFlags
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.User
  ]
});

const prefix = "a!";

// ID AYARLARI
const TICKET_KATEGORI_ID = "1506224809359577139";
const GIRIS_CIKIS_LOG_ID = "1506224809875476553";
const TICKET_LOG_ID = "1507812171252502748";
const MESAJ_LOG_ID = "1507812171252502748";
const MOD_LOG_ID = "1507812171252502748";
const TICKET_SORUMLUSU_ID = "1507852091169706125";

// Render Variables:
// KEY: TOKEN
// VALUE: Discord bot tokenin
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.log("TOKEN bulunamadı. Render Variables kısmına TOKEN ekle.");
  process.exit(1);
}

function logKanalBul(guild, kanalId) {
  return guild.channels.cache.get(kanalId);
}

async function logGonder(guild, kanalId, embed) {
  const kanal = logKanalBul(guild, kanalId);
  if (!kanal) return;

  try {
    await kanal.send({ embeds: [embed] });
  } catch (err) {
    console.log("Log gönderilemedi:", err.message);
  }
}

function sonrakiTicketNo(guild) {
  let enBuyuk = 0;

  guild.channels.cache.forEach(channel => {
    const eslesme = channel.name.match(/(?:ticket-|gizli-ticket-)(\d+)/);

    if (eslesme) {
      const sayi = parseInt(eslesme[1]);
      if (sayi > enBuyuk) enBuyuk = sayi;
    }
  });

  return String(enBuyuk + 1).padStart(3, "0");
}

function ticketSahibiId(channel) {
  if (!channel.topic) return null;

  const eslesme = channel.topic.match(/owner:(\d+)/);
  return eslesme ? eslesme[1] : null;
}

client.once("clientReady", () => {
  console.log("VenirMc Bot aktif!");
  client.user.setActivity("VenirMc Ticket");
});

// GİRİŞ LOG
client.on("guildMemberAdd", async member => {
  const embed = new EmbedBuilder()
    .setTitle("✅ Üye Katıldı")
    .setDescription(`${member} sunucuya katıldı.`)
    .addFields(
      { name: "Kullanıcı", value: `${member.user.tag}`, inline: true },
      { name: "ID", value: `${member.id}`, inline: true }
    )
    .setColor("#57F287")
    .setTimestamp();

  logGonder(member.guild, GIRIS_CIKIS_LOG_ID, embed);
});

// ÇIKIŞ LOG
client.on("guildMemberRemove", async member => {
  const embed = new EmbedBuilder()
    .setTitle("❌ Üye Ayrıldı")
    .setDescription(`${member.user.tag} sunucudan ayrıldı.`)
    .addFields(
      { name: "Kullanıcı", value: `${member.user.tag}`, inline: true },
      { name: "ID", value: `${member.id}`, inline: true }
    )
    .setColor("#ED4245")
    .setTimestamp();

  logGonder(member.guild, GIRIS_CIKIS_LOG_ID, embed);
});

// MESAJ SİLME LOG
client.on("messageDelete", async message => {
  if (!message.guild) return;
  if (message.author?.bot) return;

  const embed = new EmbedBuilder()
    .setTitle("🗑️ Mesaj Silindi")
    .addFields(
      { name: "Kanal", value: `${message.channel}`, inline: true },
      { name: "Yazan", value: message.author ? `${message.author.tag}` : "Bilinmiyor", inline: true },
      { name: "Mesaj", value: message.content ? message.content.slice(0, 1000) : "Mesaj içeriği alınamadı." }
    )
    .setColor("#ED4245")
    .setTimestamp();

  logGonder(message.guild, MESAJ_LOG_ID, embed);
});

// MESAJ DÜZENLEME LOG
client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (!newMessage.guild) return;
  if (newMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;

  const embed = new EmbedBuilder()
    .setTitle("✏️ Mesaj Düzenlendi")
    .addFields(
      { name: "Kanal", value: `${newMessage.channel}`, inline: true },
      { name: "Kullanıcı", value: `${newMessage.author.tag}`, inline: true },
      { name: "Eski Mesaj", value: oldMessage.content ? oldMessage.content.slice(0, 1000) : "Alınamadı." },
      { name: "Yeni Mesaj", value: newMessage.content ? newMessage.content.slice(0, 1000) : "Alınamadı." }
    )
    .setColor("#FEE75C")
    .setTimestamp();

  logGonder(newMessage.guild, MESAJ_LOG_ID, embed);
});

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "yardım") {
    return message.channel.send(`
📌 **VENIRMC BOT KOMUTLARI**

🎫 **Ticket**
a!ticket
a!ticketkapat
a!yetkiliçağır

📢 **Sunucu**
a!şikayet
a!öneri
a!bakım
a!sunucu
a!kurallar
a!duyuru
a!ping
a!istatistik

🎲 **Eğlence**
a!eğlence
a!zar
a!yazıtura
a!8ball
a!espri
a!meme
a!kedi
a!köpek

🛡 **Moderasyon**
a!sil
a!ban
a!kick
a!mute
a!unmute
a!uyarı
`);
  }

  if (command === "ping") {
    return message.reply(`🏓 Ping: ${client.ws.ping}ms`);
  }

  if (command === "sunucu") {
    return message.channel.send("🌍 Minecraft Sunucu IP: `play.venirmc.com`");
  }

  if (command === "kurallar") {
    return message.channel.send(`
📜 **Sunucu Kuralları**

1. Küfür yasaktır.
2. Hile yasaktır.
3. Reklam yasaktır.
4. Spam yasaktır.
5. Yetkililere saygılı olun.
6. Ticketları boş yere açmayın.
`);
  }

  if (command === "bakım") {
    return message.channel.send(`
🛠 **Sunucu Durumu**

✅ Sunucu aktif
❌ Bakım yok
🟢 Ping normal
`);
  }

  if (command === "istatistik") {
    return message.channel.send(`
📊 **Bot İstatistikleri**

Sunucu Sayısı: ${client.guilds.cache.size}
Ping: ${client.ws.ping}ms
Bot: VenirMc Bot
`);
  }

  if (command === "duyuru") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply("Bu komutu kullanmak için yetkin yok.");
    }

    const duyuru = args.join(" ");
    if (!duyuru) {
      return message.reply("Duyuru mesajı yaz. Örnek: `a!duyuru Sunucu açıldı!`");
    }

    return message.channel.send(`📢 **DUYURU**\n\n${duyuru}`);
  }

  if (command === "şikayet") {
    const sikayet = args.join(" ");
    if (!sikayet) return message.reply("Şikayet yaz.");

    const embed = new EmbedBuilder()
      .setTitle("📢 Yeni Şikayet")
      .addFields(
        { name: "Kullanıcı", value: `${message.author}`, inline: true },
        { name: "Şikayet", value: sikayet }
      )
      .setColor("#ED4245")
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
    return logGonder(message.guild, MOD_LOG_ID, embed);
  }

  if (command === "öneri") {
    const oneri = args.join(" ");
    if (!oneri) return message.reply("Öneri yaz.");

    const embed = new EmbedBuilder()
      .setTitle("💡 Yeni Öneri")
      .addFields(
        { name: "Kullanıcı", value: `${message.author}`, inline: true },
        { name: "Öneri", value: oneri }
      )
      .setColor("#5865F2")
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
    return logGonder(message.guild, MOD_LOG_ID, embed);
  }

  if (command === "yetkiliçağır") {
    return message.channel.send(`<@&${TICKET_SORUMLUSU_ID}> yetkililer çağrıldı!`);
  }

  if (command === "ticketkapat") {
    if (!message.channel.name.includes("ticket-")) {
      return message.reply("Bu komut sadece ticket kanalında kullanılır.");
    }

    await message.channel.send("Ticket 3 saniye içinde kapanıyor.");

    const embed = new EmbedBuilder()
      .setTitle("❌ Ticket Kapatıldı")
      .setDescription(`${message.author} komutla ticket kapattı.`)
      .addFields({ name: "Kanal", value: `${message.channel.name}` })
      .setColor("#ED4245")
      .setTimestamp();

    logGonder(message.guild, TICKET_LOG_ID, embed);

    return setTimeout(() => {
      message.channel.delete().catch(() => {});
    }, 3000);
  }

  if (command === "ticket") {
    const embed = new EmbedBuilder()
      .setTitle("DESTEK TALEBİ OLUŞTUR")
      .setDescription("Aşağıdaki menüden sebebinizi seçerek ticket açabilirsiniz.\n\nVenirMc Bot • Ticket Sistemi")
      .setColor("#5865F2");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_sebep")
      .setPlaceholder("Ticket sebebinizi seçin...")
      .addOptions([
        { label: "Ödeme Sorunları", value: "Ödeme Sorunları", emoji: "💳" },
        { label: "Hile Bildirimi", value: "Hile Bildirimi", emoji: "🚨" },
        { label: "Bug/Hata Bildirimi", value: "Bug/Hata Bildirimi", emoji: "🐞" },
        { label: "Yetkili Şikayet", value: "Yetkili Şikayet", emoji: "👮" },
        { label: "Genel Destek", value: "Genel Destek", emoji: "🎫" },
        { label: "ID Sorgu", value: "ID Sorgu", emoji: "🆔" }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    return message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }

  if (command === "eğlence") {
    return message.channel.send("🎲 Eğlence komutları: `a!zar`, `a!yazıtura`, `a!8ball`, `a!espri`, `a!meme`, `a!kedi`, `a!köpek`");
  }

  if (command === "zar") {
    return message.reply(`🎲 Zar: ${Math.floor(Math.random() * 6) + 1}`);
  }

  if (command === "yazıtura") {
    return message.reply(Math.random() < 0.5 ? "🪙 Yazı" : "🪙 Tura");
  }

  if (command === "8ball") {
    const cevaplar = ["Evet", "Hayır", "Belki", "Olabilir", "Sanmam", "Kesinlikle"];
    return message.reply(`🎱 ${cevaplar[Math.floor(Math.random() * cevaplar.length)]}`);
  }

  if (command === "espri") {
    const espriler = [
      "Sunucu neden yoruldu? Çok ping yedi.",
      "Bot niye sustu? Mute yemiş.",
      "JavaScript neden üzgündü? Callback aldı."
    ];
    return message.reply(espriler[Math.floor(Math.random() * espriler.length)]);
  }

  if (command === "meme") {
    return message.reply("😂 Meme: https://i.imgflip.com/30b1gx.jpg");
  }

  if (command === "kedi") {
    return message.reply("🐱 Kedi: https://cataas.com/cat");
  }

  if (command === "köpek") {
    return message.reply("🐶 Köpek: https://placedog.net/500");
  }

  if (command === "sil") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply("Mesaj silme yetkin yok.");
    }

    const miktar = parseInt(args[0]);
    if (!miktar || miktar < 1 || miktar > 100) {
      return message.reply("1 ile 100 arası sayı yaz. Örnek: `a!sil 10`");
    }

    await message.channel.bulkDelete(miktar, true);

    const embed = new EmbedBuilder()
      .setTitle("🧹 Mesajlar Silindi")
      .addFields(
        { name: "Yetkili", value: `${message.author}`, inline: true },
        { name: "Kanal", value: `${message.channel}`, inline: true },
        { name: "Miktar", value: `${miktar}`, inline: true }
      )
      .setColor("#FEE75C")
      .setTimestamp();

    logGonder(message.guild, MOD_LOG_ID, embed);

    return message.channel.send(`${miktar} mesaj silindi.`).then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 3000);
    });
  }

  if (command === "ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply("Ban yetkin yok.");
    }

    const kisi = message.mentions.members.first();
    if (!kisi) return message.reply("Kimi banlayacağım? Örnek: `a!ban @kişi sebep`");

    const sebep = args.slice(1).join(" ") || "Sebep belirtilmedi.";

    await kisi.ban({ reason: sebep });

    const embed = new EmbedBuilder()
      .setTitle("🔨 Kullanıcı Banlandı")
      .addFields(
        { name: "Kullanıcı", value: `${kisi.user.tag}`, inline: true },
        { name: "Yetkili", value: `${message.author}`, inline: true },
        { name: "Sebep", value: sebep }
      )
      .setColor("#ED4245")
      .setTimestamp();

    await message.channel.send(`${kisi.user.tag} banlandı.`);
    return logGonder(message.guild, MOD_LOG_ID, embed);
  }

  if (command === "kick") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply("Kick yetkin yok.");
    }

    const kisi = message.mentions.members.first();
    if (!kisi) return message.reply("Kimi atacacağım? Örnek: `a!kick @kişi sebep`");

    const sebep = args.slice(1).join(" ") || "Sebep belirtilmedi.";

    await kisi.kick(sebep);

    const embed = new EmbedBuilder()
      .setTitle("👢 Kullanıcı Atıldı")
      .addFields(
        { name: "Kullanıcı", value: `${kisi.user.tag}`, inline: true },
        { name: "Yetkili", value: `${message.author}`, inline: true },
        { name: "Sebep", value: sebep }
      )
      .setColor("#ED4245")
      .setTimestamp();

    await message.channel.send(`${kisi.user.tag} sunucudan atıldı.`);
    return logGonder(message.guild, MOD_LOG_ID, embed);
  }

  if (command === "mute") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply("Mute yetkin yok.");
    }

    const kisi = message.mentions.members.first();
    if (!kisi) return message.reply("Kimi susturacağım? Örnek: `a!mute @kişi sebep`");

    const sebep = args.slice(1).join(" ") || "Sebep belirtilmedi.";

    await kisi.timeout(10 * 60 * 1000, sebep);

    const embed = new EmbedBuilder()
      .setTitle("🔇 Kullanıcı Susturuldu")
      .addFields(
        { name: "Kullanıcı", value: `${kisi.user.tag}`, inline: true },
        { name: "Süre", value: "10 dakika", inline: true },
        { name: "Yetkili", value: `${message.author}`, inline: true },
        { name: "Sebep", value: sebep }
      )
      .setColor("#FEE75C")
      .setTimestamp();

    await message.channel.send(`${kisi.user.tag} 10 dakika susturuldu.`);
    return logGonder(message.guild, MOD_LOG_ID, embed);
  }

  if (command === "unmute") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply("Unmute yetkin yok.");
    }

    const kisi = message.mentions.members.first();
    if (!kisi) return message.reply("Kimin susturmasını kaldıracağım?");

    await kisi.timeout(null);

    const embed = new EmbedBuilder()
      .setTitle("🔊 Susturma Kaldırıldı")
      .addFields(
        { name: "Kullanıcı", value: `${kisi.user.tag}`, inline: true },
        { name: "Yetkili", value: `${message.author}`, inline: true }
      )
      .setColor("#57F287")
      .setTimestamp();

    await message.channel.send(`${kisi.user.tag} susturması kaldırıldı.`);
    return logGonder(message.guild, MOD_LOG_ID, embed);
  }

  if (command === "uyarı") {
    const kisi = message.mentions.members.first();
    if (!kisi) return message.reply("Kimi uyaracağım? Örnek: `a!uyarı @kişi sebep`");

    const sebep = args.slice(1).join(" ") || "Sebep belirtilmedi.";

    const embed = new EmbedBuilder()
      .setTitle("⚠️ Kullanıcı Uyarıldı")
      .addFields(
        { name: "Kullanıcı", value: `${kisi}`, inline: true },
        { name: "Yetkili", value: `${message.author}`, inline: true },
        { name: "Sebep", value: sebep }
      )
      .setColor("#FEE75C")
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
    return logGonder(message.guild, MOD_LOG_ID, embed);
  }
});

client.on("interactionCreate", async interaction => {
  try {
    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_sebep") {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const sebep = interaction.values[0];
      const numara = sonrakiTicketNo(interaction.guild);

      let ticketKanal;

      try {
        ticketKanal = await interaction.guild.channels.create({
          name: `ticket-${numara}`,
          type: ChannelType.GuildText,
          parent: TICKET_KATEGORI_ID,
          topic: `owner:${interaction.user.id};sebep:${sebep};no:${numara}`,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
              id: interaction.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
              ]
            },
            {
              id: TICKET_SORUMLUSU_ID,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
              ]
            }
          ]
        });
      } catch (err) {
        console.log("İzinli ticket kanalı açılamadı, sade kanal açılıyor:", err.message);

        ticketKanal = await interaction.guild.channels.create({
          name: `ticket-${numara}`,
          type: ChannelType.GuildText,
          parent: TICKET_KATEGORI_ID,
          topic: `owner:${interaction.user.id};sebep:${sebep};no:${numara}`
        });
      }

      const ticketEmbed = new EmbedBuilder()
        .setTitle("TICKET AÇILDI")
        .addFields(
          { name: "Kullanıcı", value: `${interaction.user}`, inline: true },
          { name: "Sebep", value: sebep, inline: true },
          { name: "Ticket No", value: `${numara}`, inline: true }
        )
        .setDescription("Destek ekibi en kısa sürede ilgilenecek.")
        .setColor("#57F287");

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_kapat")
          .setLabel("Kapat")
          .setEmoji("❌")
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId("ticket_gizle")
          .setLabel("Gizle")
          .setEmoji("👁️")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("ticket_kilitle")
          .setLabel("Kilitle")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("ticket_talep")
          .setLabel("Talep Et")
          .setEmoji("✅")
          .setStyle(ButtonStyle.Success)
      );

      await ticketKanal.send({
        content: `<@&${TICKET_SORUMLUSU_ID}> | ${interaction.user} yeni ticket açtı → **${sebep}**`,
        embeds: [ticketEmbed],
        components: [buttons]
      });

      const logEmbed = new EmbedBuilder()
        .setTitle("📋 Yeni Ticket Açıldı")
        .addFields(
          { name: "Açan", value: `${interaction.user}`, inline: true },
          { name: "Sebep", value: sebep, inline: true },
          { name: "Ticket No", value: `${numara}`, inline: true },
          { name: "Kanal", value: `${ticketKanal}`, inline: true }
        )
        .setColor("#57F287")
        .setTimestamp();

      logGonder(interaction.guild, TICKET_LOG_ID, logEmbed);

      return interaction.editReply({
        content: `Ticket açıldı: ${ticketKanal}`
      });
    }

    if (interaction.isButton()) {
      const ownerId = ticketSahibiId(interaction.channel);

      if (interaction.customId === "ticket_kapat") {
        const logEmbed = new EmbedBuilder()
          .setTitle("❌ Ticket Kapatıldı")
          .addFields(
            { name: "Kanal", value: `${interaction.channel.name}`, inline: true },
            { name: "Kapatan", value: `${interaction.user}`, inline: true }
          )
          .setColor("#ED4245")
          .setTimestamp();

        logGonder(interaction.guild, TICKET_LOG_ID, logEmbed);

        await interaction.reply("Ticket 3 saniye içinde kapanıyor.");

        return setTimeout(() => {
          interaction.channel.delete().catch(() => {});
        }, 3000);
      }

      if (interaction.customId === "ticket_gizle") {
        if (ownerId) {
          await interaction.channel.permissionOverwrites.edit(ownerId, {
            ViewChannel: false
          }).catch(() => {});
        }

        if (!interaction.channel.name.startsWith("gizli-")) {
          await interaction.channel.setName(`gizli-${interaction.channel.name}`).catch(() => {});
        }

        const logEmbed = new EmbedBuilder()
          .setTitle("👁️ Ticket Gizlendi")
          .addFields(
            { name: "Kanal", value: `${interaction.channel}`, inline: true },
            { name: "Gizleyen", value: `${interaction.user}`, inline: true }
          )
          .setColor("#FEE75C")
          .setTimestamp();

        logGonder(interaction.guild, TICKET_LOG_ID, logEmbed);

        return interaction.reply("Ticket gizlendi.");
      }

      if (interaction.customId === "ticket_kilitle") {
        if (ownerId) {
          await interaction.channel.permissionOverwrites.edit(ownerId, {
            SendMessages: false
          }).catch(() => {});
        }

        const logEmbed = new EmbedBuilder()
          .setTitle("🔒 Ticket Kilitlendi")
          .addFields(
            { name: "Kanal", value: `${interaction.channel}`, inline: true },
            { name: "Kilitleyen", value: `${interaction.user}`, inline: true }
          )
          .setColor("#FEE75C")
          .setTimestamp();

        logGonder(interaction.guild, TICKET_LOG_ID, logEmbed);

        return interaction.reply("Ticket kilitlendi.");
      }

      if (interaction.customId === "ticket_talep") {
        const logEmbed = new EmbedBuilder()
          .setTitle("✅ Ticket Talep Edildi")
          .addFields(
            { name: "Kanal", value: `${interaction.channel}`, inline: true },
            { name: "Talep Eden", value: `${interaction.user}`, inline: true }
          )
          .setColor("#57F287")
          .setTimestamp();

        logGonder(interaction.guild, TICKET_LOG_ID, logEmbed);

        return interaction.reply(`✅ ${interaction.user} bu ticketı talep etti.`);
      }
    }
  } catch (err) {
    console.log("Interaction hatası:", err);

    if (!interaction.replied && !interaction.deferred) {
      return interaction.reply({
        content: "Bir hata oluştu.",
        flags: MessageFlags.Ephemeral
      }).catch(() => {});
    }

    if (interaction.deferred) {
      return interaction.editReply("Bir hata oluştu.").catch(() => {});
    }
  }
});

client.login(TOKEN);