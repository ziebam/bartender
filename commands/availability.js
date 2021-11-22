const fs = require('fs');

const { SlashCommandBuilder } = require('@discordjs/builders');

const moment = require('moment');
const nodeHTMLToImage = require('node-html-to-image');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('availability')
		.setDescription('Shows the availability.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('current')
				.setDescription('Shows the availability for the current week.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('next')
				.setDescription('Shows the availability for the next week.')),
	async execute(interaction) {
		const parsedJSON = JSON.parse(fs.readFileSync('./mock_availability.json', 'utf8'));
		const nextWeek = interaction.options.getSubcommand() === 'next';
		// REVIEW Default to current week for invalid subcommands.
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