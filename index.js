const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const prefix = "a!";

const TICKET_KATEGORI_ID = "1506224809359577139";
const GIRIS_CIKIS_LOG_ID = "1506224809875476553";
const TICKET_LOG_ID = "1507812171252502748";
const TICKET_SORUMLUSU_ID = "1507852091169706125";

let ticketSayisi = 1;

client.once("ready", () => {
  console.log("VenirMc Bot aktif!");
  client.user.setActivity("VenirMc Ticket");
});

client.on("guildMemberAdd", member => {
  const kanal = member.guild.channels.cache.get(GIRIS_CIKIS_LOG_ID);
  if (!kanal) return;

  kanal.send(`✅ ${member.user.tag} sunucuya katıldı.`);
});

client.on("guildMemberRemove", member => {
  const kanal = member.guild.channels.cache.get(GIRIS_CIKIS_LOG_ID);
  if (!kanal) return;

  kanal.send(`❌ ${member.user.tag} sunucudan ayrıldı.`);
});

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "yardım") {
    message.channel.send(`
📌 KOMUTLAR

a!ticket
a!ticketkapat
a!yetkiliçağır
a!şikayet
a!öneri
a!bakım
a!sunucu
a!kurallar
a!ping
`);
  }

  if (command === "ping") {
    message.reply(`🏓 Ping: ${client.ws.ping}ms`);
  }

  if (command === "sunucu") {
    message.channel.send("🌍 Sunucu IP: `play.venirmc.com`");
  }

  if (command === "kurallar") {
    message.channel.send(`
📜 Kurallar

1. Küfür yasaktır.
2. Hile yasaktır.
3. Reklam yasaktır.
4. Spam yasaktır.
5. Yetkililere saygılı olun.
`);
  }

  if (command === "bakım") {
    message.channel.send(`
🛠 Sunucu Durumu

✅ Sunucu aktif
❌ Bakım yok
🟢 Ping normal
`);
  }

  if (command === "şikayet") {
    const sikayet = args.join(" ");
    if (!sikayet) return message.reply("Bir şikayet yaz.");

    message.channel.send(`
📢 Yeni Şikayet

👤 Kullanıcı: ${message.author}
📝 Şikayet: ${sikayet}
`);
  }

  if (command === "öneri") {
    const oneri = args.join(" ");
    if (!oneri) return message.reply("Bir öneri yaz.");

    message.channel.send(`
💡 Yeni Öneri

👤 Kullanıcı: ${message.author}
📝 Öneri: ${oneri}
`);
  }

  if (command === "yetkiliçağır") {
    message.channel.send(`<@&${TICKET_SORUMLUSU_ID}> yetkililer çağrıldı!`);
  }

  if (command === "ticketkapat") {
    if (!message.channel.name.startsWith("ticket-")) {
      return message.reply("Bu komut sadece ticket kanalında kullanılır.");
    }

    message.channel.send("Ticket 3 saniye içinde kapanıyor.");
    setTimeout(() => {
      message.channel.delete();
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

    message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
});

client.on("interactionCreate", async interaction => {
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_sebep") {
    const sebep = interaction.values[0];
    const numara = String(ticketSayisi).padStart(3, "0");
    ticketSayisi++;

    const ticketKanal = await interaction.guild.channels.create({
      name: `ticket-${numara}`,
      type: ChannelType.GuildText,
      parent: TICKET_KATEGORI_ID
    });

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

    const logKanal = interaction.guild.channels.cache.get(TICKET_LOG_ID);
    if (logKanal) {
      logKanal.send(`📋 Yeni Ticket Açıldı: ${ticketKanal} | Açan: ${interaction.user} | Sebep: ${sebep} | No: ${numara}`);
    }

    interaction.reply({
      content: `Ticket açıldı: ${ticketKanal}`,
      ephemeral: true
    });
  }

  if (interaction.isButton()) {
    if (interaction.customId === "ticket_kapat") {
      await interaction.reply("Ticket 3 saniye içinde kapanıyor.");

      setTimeout(() => {
        interaction.channel.delete();
      }, 3000);
    }

    if (interaction.customId === "ticket_kilitle") {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: false
      });

      interaction.reply("Ticket kilitlendi.");
    }

    if (interaction.customId === "ticket_talep") {
      interaction.reply(`✅ ${interaction.user} bu ticketı talep etti.`);
    }
  }
});

client.login(process.env.TOKEN);