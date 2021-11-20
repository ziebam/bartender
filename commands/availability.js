const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const nodeHTMLToImage = require('node-html-to-image');

const generateImage = (availability) => {
	nodeHTMLToImage({
		output: './test.png',
		html: fs.readFileSync("./assets/template.html", "utf8"),
		content: { availability: availability }
	})
}

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
		// TODO Rethink .json dynamic creation.

		const parsedJSON = JSON.parse(fs.readFileSync('./mock_availability.json', 'utf8'));
		// REVIEW Default to current week for invalid subcommands.
		const availability = interaction.options.getSubcommand() === 'next' ? parsedJSON.next : parsedJSON.current;

		generateImage(availability);

		await interaction.reply("Done.");
	},
};