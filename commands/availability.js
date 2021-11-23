const fs = require('fs');

const { SlashCommandBuilder } = require('@discordjs/builders');

const moment = require('moment');
const nodeHTMLToImage = require('node-html-to-image');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('availability')
    .setDescription('Displays the availability table for the given week.')
    .addStringOption(option =>
      option.setName('week')
        .setDescription('Which week to display the table for.')
        .setRequired(true)
        .addChoice('Availability for the current week.', 'current')
        .addChoice('Availability for the next week.', 'next')),
  async execute(interaction) {
    const parsedJSON = JSON.parse(fs.readFileSync('./mock_availability.json', 'utf8'));
    const nextWeek = interaction.options.getString('week') === 'next';
    // The only other allowed choice is "current", so we default to that when nextWeek is false.
    const availability = nextWeek ? parsedJSON.next : parsedJSON.current;

    const time = moment();
    if (nextWeek) time.add(1, 'w');

    await interaction.deferReply();
    const weekData = {
      weekNumber: time.format('W'),
      weekStart: time.clone().weekday(1).format('DD.MM.YY'),
      weekEnd: time.clone().weekday(7).format('DD.MM.YY'),
    };
    const buffer = await nodeHTMLToImage({
      html: fs.readFileSync('./assets/availabilityTemplate.html', 'utf8'),
      content: { availability: availability, weekData: weekData },
    });
    await interaction.editReply({ files: [buffer] });
  },
};