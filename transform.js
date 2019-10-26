const fs = require('fs');
const xml = require('xmlbuilder');

const loadData = (filename) => fs.readFileSync(filename, 'utf8');
const writeData = (filename, content) => fs.writeFileSync(filename, JSON.stringify(content), 'utf8')
const extractChants = (content) => {
    const rows = content.split('\n')
    const groupedRows = groupBy(rows, 7);
    return groupsToChant(groupedRows);
};
const groupBy = (content, rowsInGroup) => {
    const grouped = [];
    for(let i = 0; i < content.length; i++) {
        if(i % rowsInGroup) {
            grouped[grouped.length-1].push(content[i])
        } else {
            grouped.push([content[i]])
        }
    }
    return grouped;
}
const groupsToChant = (content) => content.map(chant => ({
        Initium: chant[2] ? chant[2] : '',
        genre: chant[3] ? chant[3] : '',
        bibliography: chant[4] ? chant[4] : '',
        rawTextMusic: chant[5] ? chant[5] : '',
        rawText: chant[6] ? chant[6] : ''
    }));
const parseText = (chant) => {
    chant.text = chant.rawText.split(' ').map((syllable) => {
        let tmpSyl = syllable.replace(/[,.;:]/, '')
        tmpSyl = tmpSyl.match(/\-/) ? {syl:tmpSyl.replace('-',''), con: 'd'} : {syl: tmpSyl, con: 's'};
        return tmpSyl
    })
    return chant;
}
const parseMusic = (chant) => {
    chant.music = chant.rawTextMusic.split('[').map((syl, index) => {
        const tmpS = syl.split(' ').map(token => {
            let syl = token.match(/(.*?)\]/)
            if(syl) {
                const tmpSyl = chant.text[index-1] ? chant.text[index-1].syl : ''
                if(syl[1].replace(/[,.;:-]/, '') !== tmpSyl) {
                    console.warn('Texts are different', chant.text[index]);
                }

            } else {
                return token;
            }

        })
        return tmpS.slice(1).filter(el => el);
    }).filter(el => el.length)
    return chant;
}



const corpus = extractChants(loadData('olddata')).map(parseText).map(parseMusic);
writeData('corpus.json',);



const createChantMEI = (chant) => {
    const mei = xml.create('mei')
    mei.ele('meiHead').ele('fileDesc').ele('title', undefined, chant.Initium);
}
