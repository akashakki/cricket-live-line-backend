const fs = require('fs');
const { Command } = require('commander');

const program = new Command();

program
  .command('create-files <name>') // Argument ko define karein
  .description('Create three files with the same name but different extensions in three different folders')
  .action((name) => {
    const txtPath = `./src/controllers/${name}.controller.js`;
    const csvPath = `./src/models/${name}.model.js`;
    const jsonPath = `./src/services/${name}.service.js`;
    const routesPath = `./src/routes/v1/${name}.route.js`;
    const validationPath = `./src/validations/${name}.validation.js`;

    // Create directories if they don't exist
    if (!fs.existsSync('./src/controllers')) {
      fs.mkdirSync('./src/controllers', { recursive: true });
    }
    if (!fs.existsSync('./src/models/')) {
      fs.mkdirSync('./src/models/', { recursive: true });
    }
    if (!fs.existsSync('./src/services/')) {
      fs.mkdirSync('./src/services/', { recursive: true });
    }
    if (!fs.existsSync('./src/routes/v1')) {
      fs.mkdirSync('./src/routes/v1', { recursive: true });
    }
    if (!fs.existsSync('./src/validations')) {
      fs.mkdirSync('./src/validations', { recursive: true });
    }

    // Create files
    fs.writeFileSync(txtPath, '');
    fs.writeFileSync(csvPath, '');
    fs.writeFileSync(jsonPath, '');
    fs.writeFileSync(routesPath, '');
    fs.writeFileSync(validationPath, '');

    console.log('Files created successfully.');
  });

program.parse(process.argv);
