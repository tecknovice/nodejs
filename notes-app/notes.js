const fs = require('fs')
const chalk = require('chalk')

const addNote = (title, body) => {
    const notes = loadNotes()
    const duplicateNotes = notes.filter(note => note.title === title)
    if (duplicateNotes.length === 0) {
        notes.push({
            title: title,
            body: body
        })
        saveNotes(notes)
        console.log(chalk.green.inverse('Note added!'))
    } else {
        console.log(chalk.red.inverse('Note duplicated!'))
    }
}

const removeNote = title => {
    const notes = loadNotes()

    // const notesToKeep = notes.filter(note => note.title !== title)
    // saveNotes(notesToKeep)   

    const noteIndex = notes.findIndex(note => note.title === title)
    if (noteIndex !== -1) {
        notes.splice(noteIndex, 1)
        saveNotes(notes)
        console.log(chalk.inverse.green('Note removed!'))
    }
    else {
        console.log(chalk.inverse.red('No note!'))
    }
}

const listNotes = () => {
    const notes = loadNotes()
    console.log(chalk.inverse('Your notes:'))
    for (const note of notes) {
        console.log(chalk.inverse(note.title), '\n', note.body)
    }
}

const readNote = title => {
    const notes = loadNotes()
    const note = notes.find(note => note.title === title)
    if (note) {
        console.log(chalk.inverse.green(note.title), '\n', note.body)
    } else {
        console.log(chalk.bgRed('note not found!'))
    }
}

const saveNotes = notes => {
    const dataJSON = JSON.stringify(notes)
    fs.writeFileSync('notes.json', dataJSON)
}

const loadNotes = () => {
    try {
        const dataBuffer = fs.readFileSync('notes.json')
        const dataJSON = dataBuffer.toString()
        return JSON.parse(dataJSON)
    } catch (error) {
        return []
    }
}

module.exports = { listNotes, addNote, removeNote, readNote }