const yargs = require('yargs')
const notes = require('./notes')

yargs.version('1.2.3')

yargs.command({
    command: 'add',
    description:'add a new note',
    builder:{
        title:{
            describe:'note title',
            demandOption: true,
            type:'string'
        },
        body:{
            describe:'note body',
            demandOption: true,
            type: 'string'
        }
    },
    handler(argv){
        notes.addNote(argv.title, argv.body)
    }
})

yargs.command({
    command: 'remove',
    describe:'remove a note',
    builder:{
        title:{
            describe:'note title',
            demandOption: true,
            type:'string'
        }
    },
    handler(argv){
        notes.removeNote(argv.title)
    }
})

yargs.command({
    command: 'list',
    description:'list all notes',
    handler(){
        notes.listNotes()
    }
})

yargs.command({
    command: 'read',
    description:'read a note',
    builder:{
        title:{
            describe:'note title',
            demandOption: true,
            type: 'string'
        }
    },
    handler(argv){
        notes.readNote(argv.title)
    }
})

yargs.parse()