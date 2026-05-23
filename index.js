const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
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
const LOG_KANAL_ID = "1507812171252502748";
const TICKET_KATEGORI_ID = "1506224809359577139";

const YETKILI_ETIKET = `
<@&1506233102601682964>
<@&1506233021190111354>
<@&1506224807354830848>
<@&1506224807354830850>
<@440095896777261056>
<@899322977093554196>
<@772483676646146078>
`;

let ticketSayisi = 1;
let bakimDurumu = "✅ Sunucu aktif\n❌ Bakım yok";

client.once("ready", () => {
  console.log("VenirMc Bot aktif!");
});

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "yardım") {
    message.channel.send(`
📌 KOMUTLAR

🎫 Ticket:
a!ticket
a!ticketkapat
a!yetkiliçağır

📢 Sunucu:
a!sunucu
a!kurallar
a!duyuru
a!bakım
a!şikayet
a!öneri
a!ping
a!istatistik

🎲 Eğlence:
a!zar
a!yazıtura
a!8ball

🛡 Moderasyon:
a!sil
a!ban
a!kick
a!mute
a!unmute
a!uyarı
`);
  }

  if (command === "ping") {
    message.reply(`🏓 ${client.ws.ping}ms`);
  }

  if (command === "sunucu") {
    message.channel.send("🌍 Minecraft Sunucu IP: `play.venirmc.com`");
  }

  if (command === "kurallar") {
    message.channel.send(`
📜 Kurallar
1. Küfür yasaktır
2. Hile yasaktır
3. Reklam yasaktır
4. Spam yasaktır
5. Yetkililere saygılı olun
`);
  }

  if (command === "bakım") {
    message.channel.send(`🛠 Sunucu Durumu\n\n${bakimDurumu}`);
  }

  if (command === "şikayet") {
    const metin = args.join(" ");
    if (!metin) return message.reply("Şikayet yaz.");
    message.channel.send(`📢 Şikayet\n${message.author}: ${metin}`);
  }

  if (command === "öneri") {
    const metin = args.join(" ");
    if (!metin) return message.reply("Öneri yaz.");
    message.channel.send(`💡 Öneri\n${message.author}: ${metin}`);
  }

  if (command === "yetkiliçağır") {
    message.channel.send(`${YETKILI_ETIKET}\nYetkililer çağrıldı!`);
  }

  if (command === "ticketkapat") {
    if (!message.channel.name.startsWith("ticket-")) return;
    message.channel.send("Ticket kapanıyor...");
    setTimeout(() => message.channel.delete(), 3000);
  }

  if (command === "zar") {
    message.reply(`🎲 ${Math.floor(Math.random() * 6) + 1}`);
  }

  if (command === "yazıtura") {
    message.reply(Math.random() < 0.5 ? "🪙 Yazı" : "🪙 Tura");
  }

  if (command === "8ball") {
    const cevaplar = ["Evet", "Hayır", "Belki", "Olabilir", "Sanmam"];
    message.reply(`🎱 ${cevaplar[Math.floor(Math.random() * cevaplar.length)]}`);
  }

  if (command === "ticket") {
    const embed = new EmbedBuilder()
      .setTitle("DESTEK TALEBİ OLUŞTUR")
      .setDescription("Aşağıdan ticket sebebinizi seçin.\n\nVenirMc Bot • Ticket Sistemi")
      .setColor("#5865F2");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_sebep")
      .setPlaceholder("Ticket sebebinizi seçin...")
      .addOptions([
        { label: "Ödeme Sorunları", value: "Ödeme Sorunları", emoji: "💳" },
        { label: "Hile Bildirimi", value: "Hile Bildirimi", emoji: "🚨" },
        { label: "Bug/Hata Bildirimi", value: "Bug/Hata Bildirimi", emoji: "🐞" },
        { label: "Yetkili Şikayet", value: "Yetkili Şikayet", emoji: "👮" },
        { label: "Genel Destek", value: "Genel Destek", emoji: "🎫" }
      ]);

    message.channel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)]
    });
  }
});

client.on("interactionCreate", async interaction => {
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_sebep") {
    const sebep = interaction.values[0];
    const numara = String(ticketSayisi).padStart(2, "0");
    ticketSayisi++;

    const ticketKanal = await interaction.guild.channels.create({
      name: `ticket-${numara}`,
      type: ChannelType.GuildText,
      parent: TICKET_KATEGORI_ID
    });

    const embed = new EmbedBuilder()
      .setTitle("TICKET AÇILDI")
      .addFields(
        { name: "Kullanıcı", value: `${interaction.user}`, inline: true },
        { name: "Sebep", value: sebep, inline: true },
        { name: "Ticket No", value: `#${numara}`, inline: true }
      )
      .setColor("#57F287");

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_kapat")
        .setLabel("Kapat")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("ticket_gizle")
        .setLabel("Gizle")
        .setStyle(ButtonStyle.Secondary)
    );

    await ticketKanal.send({
      content: `${YETKILI_ETIKET}\n${interaction.user} yeni ticket açtı!`,
      embeds: [embed],
      components: [buttons]
    });

    const logKanal = interaction.guild.channels.cache.get(LOG_KANAL_ID);

    if (logKanal) {
      logKanal.send(`📋 Yeni Ticket: ${ticketKanal} | ${interaction.user} | ${sebep}`);
    }

    interaction.reply({
      content: `Ticket açıldı: ${ticketKanal}`,
      ephemeral: true
    });
  }

  if (interaction.isButton()) {
    if (interaction.customId === "ticket_kapat") {
      await interaction.reply("Ticket 3 saniye içinde kapanıyor.");
      setTimeout(() => interaction.channel.delete(), 3000);
    }

    if (interaction.customId === "ticket_gizle") {
      await interaction.channel.setName(`gizli-${interaction.channel.name}`);
      interaction.reply("Ticket gizlendi.");
    }
  }
});

client.login(process.env.TOKEN);