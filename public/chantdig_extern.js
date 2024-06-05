var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
    let window = _____WB$wombat$assign$function_____("window");
    let self = _____WB$wombat$assign$function_____("self");
    let document = _____WB$wombat$assign$function_____("document");
    let location = _____WB$wombat$assign$function_____("location");
    let top = _____WB$wombat$assign$function_____("top");
    let parent = _____WB$wombat$assign$function_____("parent");
    let frames = _____WB$wombat$assign$function_____("frames");
    let opener = _____WB$wombat$assign$function_____("opener");

//Test: 24.3.2014:_ o.k.
// Datei als Prototyp: Februar 2014
// Reorg. Mai/Juni 2014

    var StoredData = [], MorphData = [], storedDataLimit = 0, canvasWidth = 8500, canvasHeight = 3500, curReserveVals = [],
        version = "alpha 0.6", datum = "31.10.2014", indices = "", zeigeIndices = 1,
        klickVals = [], klickStart = false, klickStore = [], axis = "";

// Basisfunktionen für Angabe der Version (samt Zeit), Errichten der Koordinatenangaben; Toggle für Kommentar an/aus

    function gibVersionUndDatum(time) {
        var c = document.getElementById("version"), txt, w, h, ctx;
        w = c.width;
        h = c.height;
        ctx = c.getContext("2d");
        txt = "ChantDigger Version " + version + " " + "published " + datum + " " + "secs: " + time + "  |  " + timenow() + "  |  " + storedDataLimit + " chants in db";
        ctx.fillStyle = "lightblue";
        ctx.fillRect(0, 0, w, h);
        ctx.font = "12px Georgia, serif";
        ctx.fillStyle = "#000000";
        ctx.fillText(txt, 10, 20);
    }

    function timenow() {
        var now = new Date(),
            ampm = 'am',
            h = now.getHours(),
            m = now.getMinutes(),
            s = now.getSeconds();
        if (h >= 12) {
            if (h > 12) h -= 12;
            ampm = 'pm';
        }

        if (m < 10) m = '0' + m;
        if (s < 10) s = '0' + s;
        return now.toLocaleDateString() + ' ' + h + ':' + m + ':' + s + ' ' + ampm;
    }

    function zeigeCanvasMetrik() {
        var w, h, canvas = document.getElementById("koordinaten"), ctx, dist, start, yDist;
        w = canvas.width;
        h = canvas.height;
        ctx = canvas.getContext("2d");
        ctx.font = "9px Georgia, serif";
        ctx.fillStyle = "#000000";
        ctx.lineWidth = 1.5;
        start = 0;
        dist = 10;
        yDist = 10;
        while (start < w) {
            if (start % 50 === 0) {
                yDist = 10;
                ctx.fillText(start, start, 20);
            }
            else {
                yDist = 5;
            }
            ctx.moveTo(start, 0);
            ctx.lineTo(start, yDist);
            ctx.stroke();
            start += dist;
        }
    }

    function commentaryOnOff() {
        if (zeigeIndices == 0) {
            zeigeIndices = 1;
            btnColor("commOnOff", "orange");
            replaceButtonText("commOnOff", "With notes");
        }
        else {
            zeigeIndices = 0;
            btnColor("commOnOff", 'lightblue');
            replaceButtonText("commOnOff", "Without notes");
        }
    }


// Laden der Daten: alle Gesänge; Verarbeitung der Silbenstrecken

    function getContents() {
        var pathOfFileToRead = "./AllCh.text", contentsOfFileAsString = FileHelper.readStringFromFileAtPath (pathOfFileToRead);
        // var pathOfFileToRead = "AllCh.text", contentsOfFileAsString = FileHelper.readStringFromFileAtPath(pathOfFileToRead);
        return contentsOfFileAsString;
    }

    function getContentsCM() {
        var pathOfFileToRead = "./AllChCM.text", contentsOfFileAsString = FileHelper.readStringFromFileAtPath (pathOfFileToRead);
        // var pathOfFileToRead = "AllCh.text", contentsOfFileAsString = FileHelper.readStringFromFileAtPath(pathOfFileToRead);
        return contentsOfFileAsString;
    }


    function FileHelper() {
    }
    {
        FileHelper.readStringFromFileAtPath = function (pathOfFileToReadFrom) {
            var request = new XMLHttpRequest(), myArray;
            request.open("GET", pathOfFileToReadFrom, false);
            request.send(null);
            myArray = request.responseText.split("\n");
            return myArray;
        }
    }

    function makeChant(a, b, c, d, e, f, g) {
        this.num = a;
        this.familie = b;
        this.titel = c;
        this.gattung = d;
        this.edition = e;
        this.noten = f;
        this.silben = g;
        this.text = "";
        this.morphs = [];
    }

    function makeMorph(a, b) {
        this.morph = a;
        this.laenge = b;
        this.vorkommen = [];
        this.numvals = [];
    }

    function startReader() {
        var mm = getContents(), curLength = mm.length / 7, starter = 0, ender = 7, i, yy, ch, start, end, time;
        start = new Date().getTime();
        commentaryOnOff();
        for (i = 0; i < curLength; i++) {
            yy = mm.slice(starter, ender);
            ch = new makeChant(i, yy[1], yy[2], yy[3], yy[4], yy[5], yy[6]);
            starter += 7;
            ender += 7;
            StoredData.push(ch);
        }
        storedDataLimit = starter / 7; // errechne die Zahl der Datensätze
        bucheMorphs();
        btnColor('Loader', 'lightblue');
        zeigeCanvasMetrik();
        end = new Date().getTime();
        time = end - start;
        gibVersionUndDatum(time / 1000.0);
    }

    function startReaderCM() {
        var mm = getContentsCM(), curLength = mm.length / 7, starter = 0, ender = 7, i, yy, ch, start, end, time;
        start = new Date().getTime();
        commentaryOnOff();
        for (i = 0; i < curLength; i++) {
            yy = mm.slice(starter, ender);
            ch = new makeChant(i, yy[1], yy[2], yy[3], yy[4], yy[5], yy[6]);
            starter += 7;
            ender += 7;
            StoredData.push(ch);
        }
        storedDataLimit = starter / 7; // errechne die Zahl der Datensätze
        bucheMorphs();
        btnColor('Loader', 'lightblue');
        zeigeCanvasMetrik();
        end = new Date().getTime();
        time = end - start;
        gibVersionUndDatum(time / 1000.0);
    }

    function bucheMorphs() {
        var note = giveNote(), counter = 0, holder = [], i, nots, notsplits, segment, sillCounter, m, n, v, yy, k, qq, lx;
        for (i = 0; i < storedDataLimit; i++) {
            nots = StoredData[i].noten;
            notsplits = nots.split(" ");
            segment = "";
            sillCounter = -1;
            for (k = 0; k < notsplits.length; k++) {
                m = note[notsplits[k]];
                if (m) {
                    segment = segment + notsplits[k] + " ";
                }
                if (((notsplits[k].charAt(0) == "[") && (k > 0)) || (k == notsplits.length - 1)) {
                    sillCounter++;
                    n = holder[segment];
                    if (n) {
                        v = [i, sillCounter];
                        MorphData[n].vorkommen.push(v);
                        StoredData[i].morphs.splice(k, 0, n);
                    }
                    else {
                        holder[segment] = counter;
                        qq = segment.trim();
                        lx = qq.split(" ").length;
                        yy = new makeMorph(qq, lx);
                        // yy = {"morph": segment, "vorkommen": [], "numvals": [], "laenge": lx};
                        v = [i, sillCounter];
                        yy.vorkommen.push(v);
                        MorphData[counter] = yy;
                        StoredData[i].morphs.splice(k, 0, counter);
                        counter++;
                    }
                    segment = "";
                }
            }
        }
    }

// Angabe des Inhalts der DB

    function makeWort(a) {
        this.wort = a;
        this.count = 1;
    }


    function startWortsuche()
    {
        var i, sills, sillux, ht = [], holder = [], counter = 0, k, its, num, curItem, silla, item, out="", stringer="";
        for (i = 0; i < storedDataLimit; i++) {
            sills = StoredData[i].silben.replace(/- /g, "");
            silla = sills.toLowerCase();
            sillux = silla.split(" ");
            for(k=0; k<sillux.length; k++)
            {
                curItem = sillux[k].replace(/[<>\[\],\;\.]/g, "");
                num = ht[curItem];
                if(num)
                {
                    its = holder[num];
                    its.count++;
                }
                else
                {
                    ht[curItem] = counter;
                    its = new makeWort(curItem);
                    holder[counter] = its;
                    counter++;
                }
            }
        }
        holder.sort(compareWords);
        for(k=0; k<holder.length; k++)
        {
            curItem = holder[k];
            out = curItem.wort + " (" + (curItem.count) + ")";
            stringer = stringer + out + '\n';
        }
        document.getElementById("ChantList").value = stringer;
    }

    function compareWords(a,b) {
        if (a.wort < b.wort)
            return -1;
        if (a.wort > b.wort)
            return 1;
        return 0;
    }


    function giveChantContents() {
        // Gib den gefragten Inhalt der DB aus. Teste, ob die Frage sinnvoll ist (ML + Introitus geht  nicht!)
        var stringer = [], q, nexter, cfam = document.getElementById("chantfam").value,
            cgat = document.getElementById("chantgattung").value, yx,
            gatter, i, chooser, tester = true;
        if ((cfam == "alle") && (cgat == "alle")) // zweimal alle
            chooser = 1;
        else if ((cfam == "alle") && (cgat != "alle")) // alle Corpora + 1 Gattung
            chooser = 2;
        else if ((cfam != "alle") && (cgat == "alle")) // 1 Corpus + alle Gattungen
            chooser = 3;
        else
            chooser = 4; // 1 Corpus und 1 Gattung
        document.getElementById("ChantList").value = "";
        gatter = cgat.substring(0, 4);
        for (i = 0; i < storedDataLimit; i++) {
            if (!tester)
                break;
            switch (chooser) {
                case 1:
                    yx = (StoredData[i].titel + " " + "(" + StoredData[i].familie + " " + StoredData[i].gattung + " " + StoredData[i].edition + ")" + " " + i + '\n');
                    stringer.push(yx);
                    break;
                case 2:
                    if (StoredData[i].gattung.search(gatter) == 0) {
                        yx = (StoredData[i].titel + " " + "(" + StoredData[i].familie + " " + StoredData[i].gattung + " " + StoredData[i].edition + ")" + " " + i + '\n');
                        stringer.push(yx);
                    }
                    break;
                case 3:
                    if (StoredData[i].familie == cfam) {
                        yx = (StoredData[i].titel + " " + "(" + StoredData[i].familie + " " + StoredData[i].gattung + " " + StoredData[i].edition + ")" + " " + i + '\n');
                        stringer.push(yx);
                    }
                    break;
                case 4:
                    if ((StoredData[i].familie == cfam) &&
                        (StoredData[i].gattung.search(gatter) == 0)) {
                        yx = (StoredData[i].titel + " " + "(" + StoredData[i].familie + " " + StoredData[i].gattung + " " + StoredData[i].edition + ")" + " " + i + '\n');
                        stringer.push(yx);
                    }
                    break;
            }
        }

        if (stringer.length > 5) {
            stringer.sort();
            nexter = "";
            for (q = 0; q < stringer.length; q++) {
                nexter = nexter + stringer[q];
            }
        }
        else {
            nexter = "This combination of corpus = " + cfam + " with genre = " + cgat + " isn't possible";
        }


        document.getElementById("ChantList").value = nexter;
    }


    function sucheTeilstring() {
        // gib die Titel, die den vorgegebenen Teilstring enthalten
        var stringer = [], q, nexter, lookup, titx;
        lookup = document.getElementById("suchString").value.toLowerCase();
        document.getElementById("ChantList").value = "";
        for (i = 0; i < storedDataLimit; i++) {
            var titx = StoredData[i].titel.toLowerCase();
            if (titx.search(lookup) > -1) {
                yx = (StoredData[i].titel + " " + "(" + StoredData[i].familie + " " + StoredData[i].gattung + " " + StoredData[i].edition + ")" + " " + i + '\n');
                stringer.push(yx);
            }
        }
        stringer.sort();
        nexter = "";
        for (q = 0; q < stringer.length; q++) {
            nexter = nexter + stringer[q];
        }
        document.getElementById("ChantList").value = nexter;
    }


// Suchmodus 1: Display eines einzelnen Gesanges
    function macheAchsentoene(a, b, c) {
        this.chantNums = a;
        this.achsenToene = b;
        this.zeigeFarben = c;

    }

    function displayChantsWithAchsenVals(chantNums, achsentoene, zeichnen)
    {
        var achsen;
        achsen = new macheAchsentoene(chantNums, achsentoene, zeichnen);
        axis = achsen;
        displayChant();
        axis = "";
    }


    function displayChant() {
        var vals, tester, out = [], werte = [], isx, i, absLaenge, mode = 0, outer, valser;
        isx = document.getElementById("seite").value;
        if(axis != "")
            vals = axis.chantNums;
        else
            vals = document.getElementById("chant").value;
        valser = vals.replace(/,/g, " ");
        tester = valser.split(" ");
        if (((tester.length == 1) && (!isNaN(tester[0]))) || (tester[1] == "x"))
            displayOneChant(valser.trim()); // normales Display eines einziges Gesanges
        else {
            out = findNumVals(tester);
            outer = pruefeStreichungen(out);
            for (i = 0; i < outer.length; i++) {
                valser = new MorphPos(outer[i], -1, findXValsOfChant(parseInt(outer[i])), [])
                werte.push(valser);
            }
            absLaenge = werte.length;
            macheSilbstrDisplay(isx, werte, absLaenge, mode);
        }
    }


    function findNumVals(ar) {
        var vals = [], i, its;
        for (i = 0; i < ar.length; i++) {
            its = ar[i];
            if (isNaN(its))
                vals = vals.concat(sucheMitTeilstring(its));
            else
                vals.push(its);
        }
        return vals;
    }

    function pruefeStreichungen(outVals) {
        var vals, i, valser, n, outx = [], item;
        vals = document.getElementById("streicheNums").value.trim();
        if (vals == "") {
            outx = outVals;
        }
        else {
            valser = vals.split(" ");
            for (i = 0; i < outVals.length; i++) {
                item = outVals[i];
                n = valser.indexOf(item);
                if (n < 0)
                    outx.push(item);
            }
        }
        return outx;
    }

    function sucheMitTeilstring(lookup) {
        var outVals = [], i, titx, sills;
        for (i = 0; i < storedDataLimit; i++) {
            sills = StoredData[i].silben.toLowerCase();
            titx = sills.replace(/- /g, "");
            if (titx.search(lookup) > -1) {
                outVals.push(i.toString());
            }
        }
        return outVals;
    }

    function displayOneChant(numx) {
        var curnum, shape = 0, shaper = {"or": 1, "lu": 2, "ld": 3},
            note = giveNote(), curVal, str, strspl, txt, txtspl, sillCounter = 0, start = 180, x = start + 50,
            canvas = document.getElementById("ausgabe"), item = "", c, liner, i, j, yy, yx, yz, m, n, haeufig, haeufigDisplay = false,
            tester, colorVals = [0, 0], color, notecounter = 0, item1, item2, x1, x2, y1, y2, sm1display;
        indices = "SM 1 Num. " + numx, sm1display = document.getElementById("sm1display").value;
        if (parseInt(sm1display) == 4) {
            klickStart = true;
            klickVals = [];
            klickStore = [];
            document.getElementById("folgen").value = "";
        }
        if (numx >= storedDataLimit) {
            alert("There's no chant Nr. " + numx);
        } else {
            tester = numx.split(" ");
            if ((tester.length > 1) && (tester[1] == "x")) {
                haeufigDisplay = true;
                curnum = parseInt(tester[0]);
            } else {
                haeufigDisplay = false;
                curnum = parseInt(tester);
            }
            curVal = StoredData[curnum];
            curReserveVals = new macheCurReserveVals([], [], curnum);
            str = curVal.noten;
            if ((sm1display > 0) && (sm1display < 4))
                str = aendereNotenInput(curVal, sm1display);
            strspl = str.split(" "), txt = curVal.silben, txtspl = txt.split(" ");
            if (haeufigDisplay) {
                haeufig = findehaeufigeNoten(strspl);
                colorVals = [haeufig[0][0], haeufig[1][0]];
            }
            if (canvas.getContext) {
                c = canvas.getContext("2d");
                c.clearRect(0, 0, canvasWidth, canvasHeight);
                displayTitel(c, curVal, 0, 0, 0);
                liner = 59;
                macheSchluessel(c, x, 0, liner, 0);
                macheNotenlinien(c, start, 0, liner, 0);
                for (i = 0; i < strspl.length; i++) {
                    item = strspl[i];
                    if (item.charAt(0) == "[") {
                        x += 20;
                        yy = txtspl[sillCounter];
                        c.font = '10pt Georgia, serif';
                        c.fillText(txtspl[sillCounter], x, 100);
                        c.font = '8pt Georgia, serif';
                        c.fillText(sillCounter, x, 115);
                        yx = curVal.morphs[sillCounter];
                        c.fillText(yx, x, 130);
                        yz = MorphData[yx].vorkommen.length;
                        c.fillText(yz, x, 145);
                        sillCounter++;
                        ready = false;
                    } else {
                        m = note[item];
                        if (item == colorVals[0])
                            color = 1;
                        else if (item == colorVals[1])
                            color = 2;
                        else
                            color = 0;
                        n = shaper[item];
                        if (n)
                            shape = n;
                        if (m) {
                            zeichneNote(c, x, m, shape, item, 0, color);
                            if ((klickStart) && (sm1display == 4)) {
                                var yx = [notecounter++, x, m, item];
                                klickVals.push(yx);
                            }
                            shape = 0;
                            x += 10;
                        }
                    }
                }
            }
        }
    }

    function aendereNotenInput(curVal, sm1display) {
        var strspl, newstr = "", morphs, i, curNum, curDats, m, l, firster, laster;
        morphs = curVal.morphs;
        for (i = 0; i < morphs.length; i++) {
            curNum = morphs[i];
            curDats = MorphData[curNum];
            m = curDats.morph.split(" ");
            l = curDats.laenge;
            firster = m[0];
            laster = m[l - 1];
            if (sm1display == 1)
                newstr = newstr + "[]" + " " + firster + " ";
            else if (sm1display == 2)
                newstr = newstr + "[]" + " " + laster + " ";
            else if (sm1display == 3)
                newstr = newstr + "[]" + " " + firster + " " + laster + " ";
        }
        return newstr;

    }

    function makeAchse(a) {
        this.achse = a;
        this.count = 1;
        this.gattungen = [0, 0, 0, 0, 0, 0, 0, 0];
        this.chantNums = [];
    }

    function findeAchsen() {
        var cfam, i, holder = [], orte, item, nots, achsen, counter = 0, ht = [], achsenTeil, num, its, curLoc, cgat,
            gatter, tester = true, achsenString, achsenzahl, achsNums, achset, rowZahl,
            dats, datsx, curLine, starter, ender, qw, achsentoene, zeichnen;
        achsNums = document.getElementById("findeAchsen").value;
        achset = achsNums.split(" ");
        if (achset[0] == "")
            achsenzahl = 3;
        else if (achset.length == 1) {
            achsenzahl = parseInt(achset[0]);
            if (achsenzahl > 5)
                achsenzahl = 5;
        }
        else if (achset.length >= 2) {
            achsenzahl = parseInt(achset[0]);
            rowZahl = parseInt(achset[1]);
            if (achset.length == 3)
                zeichnen = 1;
            else
                zeichnen = 0;
            tester = false;
            dats = document.getElementById("ChantList").value;
            datsx = dats.split('\n');
            curLine = datsx[rowZahl];
            starter = curLine.indexOf("(");
            ender = curLine.indexOf(")");
            its = curLine.substring(starter + 1, ender);
            qw = curLine.split('\t');
            achsentoene = qw[2].trim();
            displayChantsWithAchsenVals(its, achsentoene.split(" "), zeichnen);
        }
        orte = ["Intr", "Ingr", "Alle", "Grad", "Psal", "Trac", "Comm", "Offe"];
        cfam = document.getElementById("chantfam").value;
        if (cfam == "alle") {
            alert("Select a corpus: GR, AR or ML. Otherwise there are too many values.");
            tester = false;
        }
        if (tester) {
            for (i = 0; i < storedDataLimit; i++) {
                item = StoredData[i];
                if (item.familie == cfam) {
                    cgat = item.gattung;
                    gatter = cgat.substring(0, 4);
                    curLoc = orte.indexOf(gatter);
                    nots = item.noten.split(" ");
                    achsen = findehaeufigeNoten(nots);
                    achsenTeil = achsen.slice(0, achsenzahl);
                    achsenString = transformiereAchseZuString(achsenTeil);
                    num = (ht[achsenString]);
                    if (num) {
                        its = holder[num];
                        its.count++;
                        its.gattungen[curLoc]++;
                        its.chantNums.push(i);
                    }
                    else {
                        its = new makeAchse(achsenString);
                        its.gattungen[curLoc]++;
                        its.chantNums.push(i);
                        ht[achsenString] = counter;
                        holder[counter] = its;
                        counter++;
                    }
                }
            }
        }
        macheAchsenOutput(holder);
    }

    function macheAchsenOutput(holder) {
        var absx, absy, achse, cx, gatx, str, out = "", dx, counter, prefChant, yas, asd = -1, item, achsenHt = [], alerter = "";
        counter = 0;
        absx = '\t\t';
        absy = '\t\t\t';
        prefChant = document.getElementById("achseMitChant").value;
        if (prefChant != "") {
            yas = prefChant.split(" ");
            asd = parseInt(yas[0]);
        }
        for (i = 0; i < holder.length; i++) {
            item = holder[i];
            achse = item.achse.trim();
            cx = item.gattungen;
            dx = item.chantNums;
            achsenHt[i] = item;
            gatx = "Intr: " + cx[0] + " Ingr: " + cx[1] + " All: " + cx[2] + " Grad: " + cx[3] + " Psal: " + cx[4] + " Tract: " + cx[5] + " Comm: " + cx[6] + " Off: " + cx[7];
            str = "Num: " + counter++ + ": " + absx + achse + absy + " Occ: " + item.count + " Distr: " + gatx + " (" + dx + ")" + '\n';
            out = out + str;
            if ((asd != -1) && (dx.indexOf(asd) > -1))
                alerter = alert + str + '\n'
        }
        document.getElementById("ChantList").value = out.trim();
        if(alerter != "")
            alert(alerter);
    }

    function findehaeufigeNoten(nots) {
        var table, i, item, out, notser;
        table = zaehleNoten();
        notser = giveNote();
        for (i = 0; i < nots.length; i++) {
            item = nots[i];
            if(notser[item])
            {
                table[item]++;
            }
        }
        out = assocSort(table);
        return out;
    }

    function transformiereAchseZuString(achsenTeil)
    {
        var i, str = "", its;
        for(i=0; i<achsenTeil.length; i++)
        {
            its = achsenTeil[i][0];
            str = str + its + " ";
        }
        return str.trim();
    }

    function assocSort(obj) {
        var tuples = [], i, key, value;
        for (key in obj) tuples.push([key, obj[key]]);
        tuples.sort(function (a, b) {
            a = a[1];
            b = b[1];
            return a < b ? -1 : (a > b ? 1 : 0);
        });
        for (i = 0; i < tuples.length; i++) {
            key = tuples[i][0];
            value = tuples[i][1];
        }
        return tuples.reverse();
    }

// OIrganisation von mehreren Gesängen: Silbenstrecken

    function MorphPos(a, b, c, d) {
        this.chantnum = a;
        this.silbennum = b;
        this.orte = c;
        this.marken = d;
        this.silbenorte = [];
        this.kind = 0;
    }

    function organisiereMorphDisplay() {
        var morphNum = document.getElementById("strecken").value, tester, extr = "", i, vals, nums = 0, buchst = 0, extra, q,
            its;
        extr = morphNum.trim();
        extra = extr.split(" ");
        for(q=0; q<extra.length; q++)
        {
            its = extra[q];
            if(isNaN(its))
                buchst++;
            else
                nums++;
        }
        if(buchst == 0)
            beginneMorphDisplay();
        else if ((buchst == 1) && (nums != 0))
            sucheAlleModelle();
        else if ((buchst == 1) && (nums == 0))
            organisiereWortSuche(extr);
    }

    function beginneMorphDisplay() {
        var mx, l, num = document.getElementById("aehnlichfcns").value, morphNum = document.getElementById("strecken").value;
        indices = "SM 2 " + "| Segment(s): " + morphNum + " | Page: " + document.getElementById("seite").value +
            " " + document.getElementById("chantfam").value + " " + document.getElementById("chantgattung").value + " " + num;
        if (num == 0) {
            morphDisplayOhneAehnlichkeitsFcns();
        } else {
            mx = MorphData[morphNum].morph;
            if (mx.laenge < 4) {
                alert("Segment " + morphNum + " (" + mx + ") has less than four elements");
                return;
            } else {
                morphDisplayMitAehnlichkeitsFcns(num);
            }
        }
    }

    function morphDisplayOhneAehnlichkeitsFcns() {
        var nums = document.getElementById("strecken").value, isx = document.getElementById("seite").value, curVal,
            absLaenge, werte = [], i, item, vals, testNum = "", num = 0, testLength = false, mode = 0, curly;
        testNum = nums.split(" ");
        if (testNum[testNum.length - 1] == "")
            testNum.pop();
        if (testNum.length > 1) {
            num = parseInt(testNum[0]);
            testLength = true;
        }
        else {
            num = testNum;
        }
        curVal = MorphData[num].vorkommen;
        if (testLength)
            curVal = sucheMehrereVorkommen(curVal, testNum);
        absLaenge = curVal.length;
        for (i = 0; i < curVal.length; i++) {
            item = curVal[i];
            {
                if (testLength) {
                    vals = new MorphPos(item[0], item[1], findXValsOfChant(item[0]), item[3]);
                    werte.push(vals);
                }
                else {
                    if (isNaN(item[1])) // item[1] kann Number oder Array sein!!
                        curly = item[1][0]
                    else
                        curly = item[1];
                    vals = new MorphPos(item[0], curly, findXValsOfChant(item[0]), item[3]);
                    werte.push(vals);
                }
            }
        }
        if (testLength)
            mode = 4;
        macheSilbstrDisplay(isx, werte, absLaenge, mode);
    }

    function sucheMehrereVorkommen(curVork, testNums) {
        // Prüfe im Falle mehrerer gesuchter Strecken, in welchen Gesängen diese als Folge vorkommen
        // curVork = Vorkommen der ersten Strecke als Ausgangspunkt; testNums = die Strecken
        var i, item, curMorphs, getter, k, loc, lx = testNums.length, out = [], outer = [];
        for (i = 0; i < curVork.length; i++) {
            item = curVork[i];
            curMorphs = StoredData[item[0]].morphs;
            getter = [];
            for (k = 0; k < testNums.length; k++) {
                loc = curMorphs.indexOf(parseInt(testNums[k]));
                if (loc > -1)
                    getter.push(loc)
            }
            if (getter.length == lx) {
                item[1] = getter;
                out.push(item);
            }
        }
        outer = testForDuplicates(out);
        return outer;
    }

    function testForDuplicates(out) {
        //Üperprüfe, ob es innerhalb der Arrays in 'ou' Dubletten vorhanden sind
        // eine Dublette ist genau dann vorhanden, wenn der gleiuche Gesang zweimal mit
        // den gleichen Stellen vorkommt
        var outer = [], tester = [], i, item;
        for (i = 0; i < out.length; i++) {
            item = out[i];
            if (!tester[item[0], item[1]]) {
                tester[item[0], item[1]] = 1;
                outer.push(item);
            }
        }
        return outer;
    }

    function macheSilbstrDisplay(isx, werte, absLaenge, mode) {
        var gattung, corpus, starter, ender, theMax, chantVals;
        starter = (isx * 20) - 20;
        ender = (isx * 20);
        if (starter > werte.length) {
            alert("There are not so many segments")
        } else {
            werte = werte.slice(starter, ender);
        }
        if (mode < 4)
            theMax = findMaxVal(werte);
        if (mode == 0) {
            chantVals = correctXVals(werte, theMax);
            macheAnzeige(absLaenge);
        }
        else if (mode == 1) {
            chantVals = correctXValsMitMarken(werte);
            macheAnzeige(absLaenge);
        } else if (mode == 2) {
            chantVals = correctXVals(werte, theMax);
            macheAnzeige(absLaenge);
        } else if (mode == 4) {
            chantVals = organisiereMehrereKoords(werte);
            macheAnzeige(absLaenge);
        }
        if ((mode == 0) || (mode == 2) || (mode == 4)) {
            curReserveVals = new macheCurReserveVals(chantVals, starter, -1);
            displayChantsWithSilbenstrecken(chantVals, starter);
        }
        else if (mode == 1) {
            curReserveVals = new macheCurReserveVals(chantVals, starter, -1);
            displayChantsWithSearchIndications(chantVals, starter);
        }
    }

    function macheCurReserveVals(a, b, c) {
        this.vals = a;
        this.starter = b;
        this.chantnum = c;
    }

// Strecken mit Aehnlichkeitsfunktionen

    function morphDisplayMitAehnlichkeitsFcns(num) {
        var alleMorphs = [], morphNum = document.getElementById("strecken").value, isx = document.getElementById("seite").value,
            curVal = [], allNums = [], curNum, vork, j, absLaenge, werte = [], item, marker, vals, i;
        alleMorphs = sammleVals(num, morphNum);
        for (i = 0; i < alleMorphs.length; i++) {
            curNum = alleMorphs[i];
            vork = MorphData[curNum].vorkommen;
            for (j = 0; j < vork.length; j++) {
                allNums.push(curNum);
            }
            curVal = curVal.concat(vork);
        }
        absLaenge = curVal.length;
        for (i = 0; i < curVal.length; i++) {
            item = curVal[i];
            {
                marker = [morphNum, allNums[i], num];
                vals = new MorphPos(item[0], item[1], findXValsOfChant(item[0]), marker);
                werte.push(vals);
            }
        }
        macheSilbstrDisplay(isx, werte, absLaenge, 0);
    }

    function sammleVals(num, morphNum) {
        var morph = MorphData[morphNum].morph, intervalle = giveIntervals(), firstVals = bildeNumVals(num, morph, intervalle),
            holdVals = [], i, curMorph, tester;
        for (i = 0; i < MorphData.length; i++) {
            curMorph = MorphData[i].morph;
            if ((curMorph.split(" ").length) >= 4) {
                tester = bildeNumVals(num, curMorph, intervalle);
                if (areArraysEqual(tester, firstVals))
                    holdVals.push(i);
            }
        }
        return holdVals;
    }

    function areArraysEqual(ar1, ar2) {
        var tester = true, i;
        if (ar1.length != ar2.length) {
            tester = false;
            return;
        }
        for (i = 0; i < ar1.length; i++) {
            if (ar1[i] != ar2[i]) {
                tester = false;
                break;
            }
        }
        return tester;
    }


    function testeWerte(werte, gattung, corpus) {
        var getter = [], i, item, theChant;
        if ((gattung != "alle") && (corpus === "alle")) {
            for (i = 0; i < werte.length; i++) {
                item = werte[i];
                theChant = StoredData[item.chantnum];
                if (theChant.gattung.search(gattung) > -1) {
                    getter.push(item);
                }
            }
        }
        if ((corpus != "alle") && (gattung === "alle")) {
            for (i = 0; i < werte.length; i++) {
                item = werte[i];
                theChant = StoredData[item.chantnum];
                if (theChant.familie === corpus) {
                    getter.push(item);
                }
            }
        }
        if ((corpus != "alle") && (gattung != "alle")) {
            for (i = 0; i < werte.length; i++) {
                item = werte[i];
                theChant = StoredData[item.chantnum];
                if ((theChant.familie === corpus) && (theChant.gattung.search(gattung) > -1)) {
                    getter.push(item);
                }
            }
        }
        return getter;
    }


    function organisiereSearchDisplay() {
        var resultat = getSearchInput(), absLaenge, isx, werte = [], i, item, testit = false;
        if (resultat) {
            testit = true;
            absLaenge = resultat.length;
            isx = document.getElementById("seite").value;
            indices = "SM 3 | Search: " + document.getElementById("folgen").value + " | Page: " + isx + " " + document.getElementById("chantfam").value + " " +
                document.getElementById("chantgattung").value;
            for (i = 0; i < resultat.length; i++) {
                item = resultat[i];
                item.orte = findAllXVals(item.chantnum);
                item.silbenorte = findXValsOfChant(item.chantnum);
                werte.push(item);
            }
        }
        if (testit)
            macheSilbstrDisplay(isx, werte, absLaenge, 1);
    }

    function correctXValsMitMarken(vals) {
        var theCrit = 500, i, curVal, itser, checkPoint, theDiff, k;
        for (i = 0; i < vals.length; i++) {
            curVal = vals[i];
            itser = curVal.marken[0];
            checkPoint = curVal.orte[itser];
            theDiff = 0;
            theDiff = Math.abs(theCrit - checkPoint);
            if (checkPoint > theCrit) {
                theDiff = theCrit - checkPoint;
            }
            for (k = 0; k < curVal.orte.length; k++) {
                curVal.orte[k] += theDiff;
            }
            for (k = 0; k < curVal.silbenorte.length; k++) {
                curVal.silbenorte[k] += theDiff;
            }
        }
        return vals;
    }

    function findeMaxValInMarks(vals) {
        var theMax = 0, i, item;
        for (i = 0; i < vals.length; i++) {
            item = vals[i];
            if (item.marken[0] < theMax)
                theMax = item.marken[0];
        }
        return theMax;
    }


    function displayChantsWithSilbenstrecken(vals, starter) {
        var x, shape = 0, canvas = document.getElementById("ausgabe"), dist = 150, shaper = {
                "or": 1,
                "lu": 2,
                "ld": 3
            }, note = giveNote(),
            curDist, curInst, orte, curnum, curVal, str, strspl, txt, txtspl, sillCounter, liner, start, j, item, c = canvas.getContext("2d"),
            i, yy, yx, yz, m, n, sillDisplayY = vals.length * 150, sillDisplayAdder = 20, curSillDisplay, goOn = true, drawOn = true, noDraws = false;
        c.clearRect(0, 0, canvasWidth, canvasHeight);
        if (vals[0].kind == 6) {
            noDraws = true;
            zeichneGleichLangeGesaenge(canvas, vals, sillDisplayY);
        }
        for (j = 0; j < vals.length; j++) {
            if (j > 0)
                goOn = false;
            curSillDisplay = sillDisplayY + sillDisplayAdder * j;
            curDist = j * dist;
            curInst = vals[j];
            orte = curInst.orte;
            curnum = parseInt(curInst.chantnum);
            curVal = StoredData[curnum];
            str = curVal.noten;
            strspl = str.split(" ");
            txt = curVal.silben;
            txtspl = txt.split(" ");
            sillCounter = 0;
            liner = 59;
            start = 180;
            x = start + 50;
            item = "";
            if (canvas.getContext) {
                displayTitel(c, curVal, j, dist, 1, starter);
                macheSchluessel(c, x, j, liner, dist);
                macheNotenlinien(c, start, j, liner, dist);
                for (i = 0; i < strspl.length; i++) {
                    item = strspl[i];
                    if (item.charAt(0) == "[") {
                        x = orte[sillCounter];
                        if ((sillCounter == 0) && (curInst.marken)) {
                            c.font = '10pt Georgia, serif';
                            c.fillText(curInst.marken, x, 28 + curDist);
                        }
                        yy = txtspl[sillCounter];
                        c.font = '10pt Georgia, serif';
                        c.fillText(txtspl[sillCounter], x, 100 + curDist);
                        if (!noDraws)
                            c.fillText(txtspl[sillCounter], x, 100 + curSillDisplay);
                        if (goOn) {
                            c.fillStyle = 'red';
                            if (!noDraws)
                                c.fillText(curVal.morphs[sillCounter], x, 80 + curSillDisplay);
                            c.fillStyle = 'black';
                            if ((drawOn) && (!noDraws)) {
                                drawSegmentsOfMatches(canvas, curSillDisplay, curInst, vals.length);
                                drawOn = false;
                            }
                        }
                        c.font = '8pt Georgia, serif';
                        c.fillStyle = 'black';
                        c.fillText(sillCounter, x, 115 + curDist);
                        yx = curVal.morphs[sillCounter];
                        c.fillText(yx, x, 130 + curDist);
                        yz = MorphData[yx].vorkommen.length;
                        c.fillText(yz, x, 145 + curDist);
                        sillCounter++;
                    } else {
                        m = note[item];
                        n = shaper[item];
                        if (n)
                            shape = n;
                        if (m) {
                            m += curDist;
                            zeichneNote(c, x, m, shape, item, curDist);
                            shape = 0;
                            x += 10;
                        }
                    }
                }
            }
        }
    }

    function drawSegmentsOfMatches(canvas, curSillDisplay, curInst, laenge) {
        var i, curVals = curInst.silbennum, ctx, yStart, theWidth, theLength, xStart;
        yStart = curSillDisplay + 60;
        theWidth = 50;
        theLength = 20 * laenge + 30;
        if (typeof(curVals) === "number") {
            xStart = curInst.orte[curVals] - 10;
            ctx = canvas.getContext('2d');
            ctx.fillStyle = "LightGray";
            ctx.fillRect(xStart, yStart, theWidth, theLength);
        } else {
            for (i = 0; i < curVals.length; i++) {
                xStart = curInst.orte[curVals[i]] - 10;
                ctx = canvas.getContext('2d');
                ctx.fillStyle = "LightGray ";
                ctx.fillRect(xStart, yStart, theWidth, theLength);
            }
        }
    }

    function zeichneGleichLangeGesaenge(canvas, vals, sillDisplayY) {
        var curVal, i, curY = sillDisplayY + 100, xStart = 180, dister = 40, j, x, curnum, curInst, txt, txtspl, ctx,
            drawNums = true;
        for (i = 0; i < vals.length; i++) {
            curInst = vals[i];
            if (i > 0)
                drawNums = false;
            curnum = parseInt(curInst.chantnum);
            curVal = StoredData[curnum];
            txt = curVal.silben;
            txtspl = txt.split(" ");
            ctx = canvas.getContext('2d');
            ctx.font = '10pt Georgia, serif';
            ctx.fillStyle = 'black';
            x = xStart;
            for (j = 0; j < txtspl.length; j++) {
                ctx.fillText(txtspl[j], x, curY);
                if (drawNums) {
                    ctx.fillStyle = 'red';
                    ctx.fillText(j, x, curY - 30);
                }
                ctx.fillStyle = 'black';
                x += dister;
            }
            curY += 20;
        }
    }

    function displayChantsWithSearchIndications(vals, starter) {
        var canvas = document.getElementById("ausgabe"), dist = 150, note = giveNote(), shape = 0, shaper = {
                "or": 1,
                "lu": 2,
                "ld": 3
            },
            critDist = 230, c = canvas.getContext("2d"), curDist, x, curInst, orte, checker, curnum, curVal, str, ortezaehler, sillRes, sillCheck, notecounter, strspl, txt, txtspl, sillCounter, liner, start, j, item, marken,
            silbenorte, i, yy, yx, yz, itsx, startY, f, m, n;
        c.clearRect(0, 0, canvasWidth, canvasHeight);
        for (j = 0; j < vals.length; j++) {
            curDist = j * dist;
            curInst = vals[j];
            marken = curInst.marken;
            silbenorte = curInst.silbenorte;
            notecounter = 0;
            ortezaehler = 0;
            orte = curInst.orte;
            curnum = parseInt(curInst.chantnum);
            curVal = StoredData[curnum];
            str = curVal.noten;
            strspl = str.split(" ");
            txt = curVal.silben;
            txtspl = txt.split(" ");
            sillCounter = 0;
            liner = 59;
            start = 180;
            x = start + 50;
            item = "";
            sillRes = [];
            sillCheck = true;
            if (canvas.getContext) {
                displayTitel(c, curVal, j, dist, 1, starter);
                macheSchluessel(c, x, j, liner, dist);
                macheNotenlinien(c, start, j, liner, dist);
                checker = true;
                for (i = 0; i < strspl.length; i++) {
                    item = strspl[i];
                    if (item.charAt(0) == "[") {
                        x = silbenorte[sillCounter] + 10;
                        if (x > critDist) {
                            yy = txtspl[sillCounter];
                            if (checker) {
                                checker = false;
                                itsx = txtspl.slice(0, sillCounter);
                                itsx = doReplaceItems(itsx);
                                startY = 100;
                                for (f = 0; f < itsx.length; f++) {
                                    c.font = '8pt Georgia, serif';
                                    c.fillText(itsx[f], 5, startY + curDist);
                                    startY += 15;
                                }
                            }
                            c.font = '10pt Georgia, serif';
                            c.fillText(txtspl[sillCounter], x, 100 + curDist);
                            c.font = '8pt Georgia, serif';
                            c.fillText(sillCounter, x, 115 + curDist);
                            yx = curVal.morphs[sillCounter];
                            c.fillText(yx, x, 130 + curDist);
                            yz = MorphData[yx].vorkommen.length;
                            c.fillText(yz, x, 145 + curDist);
                        }
                        sillCounter++;
                    } else {
                        m = note[item];
                        n = shaper[item];
                        if (n)
                            shape = n;
                        if (m) {
                            m += curDist;
                            x = orte[notecounter];
                            if (x > critDist) {
                                zeichneNote(c, x, m, shape, item, curDist);
                                shape = 0;
                                if (marken) {
                                    if (marken[ortezaehler] == notecounter) {
                                        c.beginPath();
                                        c.lineWidth = 1;
                                        c.strokeStyle = '#ff0000';
                                        c.arc(x + 1, m + 1, 5, 0, 2 * Math.PI, true);
                                        c.stroke();
                                        c.strokeStyle = '#000000';
                                        ortezaehler++;
                                    }
                                }
                            }
                            x += 10;
                            notecounter++;
                        }
                    }
                }
            }
        }
    }

    function doReplaceItems(items) {
        var out = "", holder = [], its = "", i, y, l;
        for (i = 0; i < items.length; i++) {
            y = items[i];
            l = items.length - 1;
            if (y.substring(y.length - 1) == "-") {
                if ((i == l) || ((out.length + y.length) > 30)) {
                    its = y;
                    out = out + its;
                } else {
                    its = y.substring(0, y.length - 1);
                    out = out + its;
                }

            } else {
                its = y + " ";
                out = out + its;
            }

            if (out.length > 30) {
                holder.push(out);
                out = "";
            }
        }
        holder.push(out);
        return holder;
    }

    function correctXVals(werte, theMax) {
        var i, newAr, curAr, curOrte, silbennum, theDiff, k;
        for (i = 0; i < werte.length; i++) {
            newAr = [];
            curAr = werte[i];
            curOrte = curAr.orte;
            silbennum = curAr.silbennum;
            theDiff = theMax - curOrte[silbennum];
            if (theDiff > 0) {
                for (k = 0; k < curOrte.length; k++) {
                    if (curOrte[k] < curOrte[silbennum]) {
                        newAr.push(curOrte[k]);
                    } else {
                        newAr.push(curOrte[k] + theDiff);
                    }
                }
            } else {
                newAr = curOrte;
            }
            werte[i].orte = newAr;
        }
        return werte;
    }

    function findMaxVal(vals) {
        var theMax = 0, i, curAr, curVal;
        for (i = 0; i < vals.length; i++) {
            curAr = vals[i];
            curVal = curAr.orte[curAr.silbennum];
            if (curVal > theMax)
                theMax = curVal;
        }
        return theMax;
    }

    function organisiereMehrereKoords(vals) {
        var lx, i, stellen = [], curVals, curOrte, curSill, curPos, diffs = [], theMax, k, curDiff, newAr;
        lx = vals[0].silbennum.length;
        theMax = 0;
        for (i = 0; i < lx; i++) {
            for (k = 0; k < vals.length; k++) {
                curVals = vals[k];
                curOrte = curVals.orte;
                curSill = curVals.silbennum[i];
                curPos = curOrte[curSill];
                stellen.push(curPos);
                if (theMax < curPos)
                    theMax = curPos;
            }
            for (j = 0; j < stellen.length; j++) {
                diffs.push(theMax - stellen[j]);
            }
            for (k = 0; k < vals.length; k++) {
                curVals = vals[k];
                curOrte = curVals.orte;
                curSill = curVals.silbennum[i];
                curDiff = diffs[k];
                newAr = [];
                for (j = 0; j < curOrte.length; j++) {
                    if (j >= curSill)
                        newAr.push(curOrte[j] + curDiff);
                    else
                        newAr.push(curOrte[j]);
                }
                curVals.orte = newAr;
            }
            stellen = [];
            diffs = [];
        }
        return vals;

    }

    function findXValsOfChant(num) {
        var i, item = "", m, out = [], x, curVal = StoredData[num], note = giveNote(), str, strspl, start;
        str = curVal.noten;
        strspl = str.split(" ");
        start = 180;
        x = start + 20;
        for (i = 0; i < strspl.length; i++) {
            item = strspl[i];
            if (item.charAt(0) == "[") {
                x += 20;
                out.push(x);
            } else {
                m = note[item];
                if (m) {
                    x += 10;
                }
            }
        }
        return out;
    }

    function findAllXVals(num) {
        var curVal = StoredData[num], note = giveNote(), str, strspl, start, x, out = [], item = "", i, m;
        str = curVal.noten;
        strspl = str.split(" ");
        start = 180;
        x = start + 20;
        for (i = 0; i < strspl.length; i++) {
            item = strspl[i];
            if (item.charAt(0) == "[") {
                x += 20;
            } else {
                m = note[item];
                if (m) {
                    x += 10;
                    out.push(x);
                }
            }
        }
        return out;
    }

// Symmetrische Variante zum Suchmodus 2: finde Folgen von Strecken

    function sucheAlleModelle() {
        // suche nach allen möglichen Modellen _ohne_ Vorlage, d.h. prüfe die angegebene Gattiung im
        // angegebenen Corpus auf alle möglichen Modelle
        var gattung, corpus, minAnzahl, resultat, res, itser, nexter,
            minLaenge, minVorkommen, moeglicheFolgen, thevals;
        gattung = document.getElementById("chantgattung").value;
        corpus = document.getElementById("chantfam").value;
        if ((gattung == "alle") || (corpus == "alle")) {
            alert("Please, select a corpus and a genre");
        } else {
            thevals = document.getElementById("strecken").value.split(" ");
            minAnzahl = parseInt(thevals[1]);
            minLaenge = parseInt(thevals[2]);
            minVorkommen = parseInt(thevals[3]);
            moeglicheFolgen = bildeAlleMoeglichenFolgen(minLaenge, minAnzahl, gattung, corpus);
            resultat = bildeVorhandeneFolgen(moeglicheFolgen, minAnzahl, minVorkommen);
            nexter = ""; //
            for (j = 0; j < resultat.length; j++) {
                itser = resultat[j].toString();
                res = itser.replace(/,/g, " ");
                nexter = nexter + res + '\n';
            }
            document.getElementById("ChantList").value = nexter;
        }
    }


    function bildeAlleMoeglichenFolgen(minLaenge, minAnzahl, gattung, corpus) {
        // Untersuche die morphs aller Instanzen der gewähltenn Gattung + Familie (= corpus)
        // Buche alle Folgen, die insgesamt >= minAnzahl sind
        var i, curInst, curMorphs, j, its, holder, curMorphNum, out = [], itser, xy;
        for (i = 0; i < StoredData.length; i++) {
            curInst = StoredData[i];
            if ((curInst.familie == corpus) && (curInst.gattung.search(gattung) > -1)) {
                curMorphs = curInst.morphs;
                holder = [];
                for (j = 0; j < curMorphs.length; j++) {
                    its = curMorphs[j];
                    if (MorphData[its].laenge >= minLaenge) {
                        holder.push(its); // buche alle Silbenstrecken, die in Frage kommen
                    }
                }
                if (holder.length >= minAnzahl) { // gibt es genügend relevante Strecken
                    xy = new macheEvModell(curInst.num, holder);
                    out.push(xy);
                }
            }
        }
        return out;
    }


    function macheEvModell(a, b) {
        this.chantNum = a;
        this.folgen = [b];
    }

    function bildeVorhandeneFolgen(moeglicheFolgen, minAnzahl, minVorkommen) {
        // bilde von allen Folgen (gewonnen durch fcn 'bildeAlleMoeglichenFolgen') die möglichen
        // intersections
        var k, its1, its2, inters, tester = [], curVal, curNextVal, j, result = [],
            num1, num2, chantsTest = [];
        for (j = 0; j < moeglicheFolgen.length; j++) {
            curVal = moeglicheFolgen[j];
            its1 = curVal.folgen;
            for (k = 0; k < moeglicheFolgen.length; k++) {
                curNextVal = moeglicheFolgen[k];
                if (k != j) {
                    its2 = curNextVal.folgen;
                    num1 = curVal.chantNum;
                    num2 = curNextVal.chantNum;
                    if ((!chantsTest[num1 + " " + num2]) && (!chantsTest[num2 + " " + num1])) {
                        chantsTest[num1 + " " + num2] = 1;
                        inters = macheInters(its1[0], its2[0]);
                        if (inters.length >= minAnzahl) {
                            if (tester[inters]) {
                                tester[inters]++;
                            }
                            else {
                                tester[inters] = 1;
                            }
                        }

                    }
                }
            }
        }
        var key, itser, curNum, vork, out, counter = 0;
        for (key in tester) { // Teste die Intersections auf Brauchbarkeit
            itser = key.split(",");
            curNum = parseInt(itser[0]);
            vork = MorphData[curNum].vorkommen;
            out = sucheMehrereVorkommen(vork, itser)
            if (out.length >= minVorkommen)
                result.push(counter++ + "\t" + key + "\t(" + out.length + ")");
        }
        return result;
    }


    function macheInters(ar1, ar2) { // Intersection der Arrays ar1 und ar2
        var j, out = [], m, item, tester = [];
        for (j = 0; j < ar1.length; j++) {
            item = ar1[j];
            if (!tester[item]) { // buche jede Strecke nur éin Mal
                m = ar2.indexOf(item);
                tester[item] = 1;
                if (m > -1) {
                    out.push(item);
                }
            }
        }
        return out;
    }

    function macheModell(a, b, c, d) {
        this.chantNum = a;
        this.morphs = b;
        this.zeichen = c;
        this.anzahl = d;
    }

    function kombiniereMorphs(ar) {
        var b, i;
        b = "";
        for (i = 0; i < ar.length; i++) {
            b = b + ar[i];
        }
        return b;
    }


    function makeSilbenPos(a, b) {
        this.num = a;
        this.posOfWord = b;

    }

    function organisiereWortSuche(wort) {
        var i, item, vals, werte = [], theMax = 0, isx, starter, ender, curOrte, out;
        out = sucheWort(wort);
        isx = document.getElementById("seite").value;
        for (i = 0; i < out.length; i++) {
            item = out[i];
            vals = new MorphPos(item.num, item.posOfWord, findXValsOfChant(item.num), []);
            werte.push(vals);
        }
        for (i = 0; i < werte.length; i++) {
            item = werte[i];
            if (theMax < item.orte[item.silbennum])
                theMax = item.orte[item.silbennum];
        }
        werte = correctXVals(werte, theMax);
        starter = (isx * 20) - 20;
        ender = (isx * 20);
        indices = "Search for word <" + wort + ">, p. " + isx;
        if (starter > werte.length) {
            alert("Perhaps you must give another page number.")
        } else {
            werte = werte.slice(starter, ender);
            macheAnzeige(out.length, "sillDisplay");
        }
        curReserveVals = new macheCurReserveVals(werte, starter, -1);
        displayChantsWithSilbenstrecken(werte, starter);
    }

    function sucheWort(wort) {
        var i, curVal, sills, n, ax, q, siller, curx, vals = [], silla, j, y, nx, sillux;
        for (i = 0; i < StoredData.length; i++) {
            curVal = StoredData[i];
            sillux = curVal.silben.toLowerCase();
            silla = sillux.split(" ");
            sills = sillux.replace(/- /g, "");
            siller = sills.split(" ");
            n = siller.indexOf(wort); // Ort des Wortes
            ax = [];
            if (n > -1) {
                ax = findeWortgrenzen(silla);
                nx = fineAlleWortvorkommen(wort, siller);
                for(j=0; j<nx.length; j++) {
                    y = nx[j];
                    curx = new makeSilbenPos(i, ax[y - 1] + 1);
                    vals.push(curx);
                }
            }
        }
        return vals;
    }

    function fineAlleWortvorkommen(wort, siller) {
        var i, ax = [], item;
        for (i = 0; i < siller.length; i++) {
            item = siller[i];
            if (item == wort)
                ax.push(i);
        }
        return ax;
    }


    function findeWortgrenzen(silben)
    {
        var ax, i, item, l;
        ax = [];
        for(i=0; i<silben.length; i++)
        {
            item = silben[i];
            l = item.length - 1;
            if (item.substring(l) != "-") {
                ax.push(i); // Wort- und Silbenkorrespondenz
            }
        }
        return ax;
    }

// Suchmodus 3: suche eine Folge

    function bookNotes(nots) {
        var noteCounter = 0, table = giveTable(), i, item;
        for (i = 0; i < nots.length; i++) {
            item = nots[i];
            if (table[item]) {
                table[item].push(noteCounter++);
            }
        }
        return table;
    }


    function getSearchInput() {
        var theSearch = document.getElementById("folgen").value, result, test, ax;
        ax = theSearch.trim();
        test = theSearch.split(" ");
        if (theSearch == "")
            bildeFolge();
        else if (test.length == 2)
            sucheSegmente(ax);
        else {
            theSearch = testeFolgen(ax);
            result = continueSearchInput(theSearch);
            return result;
        }
    }


    function testeFolgen(folgen)
    {
        var i, ht = giveNote(), out = "", tester, item;
        tester = folgen.split(" ");
        for(i=0; i<tester.length; i++)
        {
            item = tester[i];
            if(ht[item])
                out = out + item + " ";
            else if((isNaN(item)) && (!ht[item]) && (item.length == 2))
            {
                out = out + item[0] + "'" + " ";
            }
            else if (!isNaN(item))
                out = out + item + " ";
        }
        return out.trim();
    }

    function continueSearchInput(theSearch) {
        var searchStr, startItem, testLength, lengthOfSearch,
            orteResultat = [], out = [], i, curVal, chantNum, str, strspl, itser, checker, startArray, sert, j;
        searchStr = theSearch.split(" ");
        startItem = searchStr[0];
        testLength = searchStr.length - 1;
        lengthOfSearch = parseInt(searchStr[searchStr.length - 1]);
        for (i = 0; i < StoredData.length; i++) {
            curVal = StoredData[i];
            chantNum = curVal.num;
            str = curVal.noten;
            if (str) {
                strspl = str.split(" ");
                itser = bookNotes(strspl);
                checker = testItser(itser, searchStr);
                if (checker) {
                    startArray = itser[startItem];
                    for (j = 0; j < startArray.length; j++) {
                        out = lookForPath(startArray[j], itser, lengthOfSearch, searchStr, testLength);
                        if (out.length > 0) {
                            sert = new MorphPos(chantNum, 0, [], out);
                            orteResultat.push(sert);
                            out = [];
                            break;
                        }
                    }
                }
            }
        }
        return orteResultat;
    }

    function testItser(itser, searchStr) {
        var checker = true, i, item;
        for (i = 0; i < searchStr.length - 1; i++) {
            item = searchStr[i];
            if (itser[item].length > 0) {
                checker = true;
            }
            else {
                checker = false;
                break;
            }
        }
        return checker;
    }

    function lookForPath(startVal, itser, lengthOfSearch, searchStr, testLength) {
        var out = [], bezugspunkt = startVal, i, curArray, getter, firster, laster;
        out.push(startVal);
        for (i = 1; i < searchStr.length - 1; i++) {
            curArray = itser[searchStr[i]];
            getter = checkIfBigger(bezugspunkt, curArray);
            if (getter > 0) {
                out.push(getter);
                bezugspunkt = getter;
            } else {
                break;
            }
        }
        if (out.length < testLength) {
            out = [];
        } else {
            firster = out[0];
            laster = out[out.length - 1];
            if ((laster - firster) > (lengthOfSearch - 1))
                out = [];
        }
        return out;

    }

    function checkIfBigger(bezug, testArray) {
        var checker = 0, i, item;
        if (testArray) {
            for (i = 0; i < testArray.length; i++) {
                item = testArray[i];
                if (item > bezug) {
                    checker = item;
                    break;
                }
            }
        }
        return checker;
    }


// Suchmodus 4: stelle V_N dar (mit gegebenem V_N)

    function macheVKN() {
        var inp, lst;
        inp = document.getElementById("vkn").value;
        lst = inp.split(" ");
        if (isNaN(lst[0]))
            findeVKNs();
        else
            bildeVKNmitV_N();
    }

    function bildeVKNmitV_N() {
        var inp = document.getElementById("vkn").value.trim(), limit, val1, val2, xy, result;
        indices = "SM 4 | BNA: " + inp + " | Page: " + document.getElementById("seite").value + " " + document.getElementById("chantfam").value + " "
            + document.getElementById("chantgattung").value;
        xy = inp.split(" ");
        if ((xy.length < 2) || (xy.length > 2))
            alert("GGive the two values for B_A");
        if (xy.length == 2) {
            val1 = parseInt(xy[0]);
            val2 = parseInt(xy[1]);
            organisiereMorphDisplayVonVN(val1, val2);
        }
    }

    function organisiereMorphDisplayVonVN(val1, val2) {
        var isx = document.getElementById("seite").value.trim(), zwischen = MorphData[val1].vorkommen, curVal = [], i, item, morphs, loc, ll, testMorph,
            absLaenge, werte = [], vals;
        for (i = 0; i < zwischen.length; i++) {
            item = zwischen[i];
            morphs = StoredData[item[0]].morphs;
            loc = item[1];
            if (morphs[loc + 2] == val2) {
                curVal.push(item);
            }
        }
        curVal.sort();
        absLaenge = curVal.length;
        for (i = 0; i < curVal.length; i++) {
            item = curVal[i];
            {
                vals = new MorphPos(item[0], item[1], findXValsOfChant(item[0]), item[3]);
                werte.push(vals);
            }
        }
        macheSilbstrDisplay(isx, werte, absLaenge, 2);
    }

    function findeVKNs() {
        // finde VKN bei Eingabe wie a 5 15 5 = Kern = 5, Gesamtlänge = 15 und Anzahl = 5
        var inp, lst, kern, laenge, anzahl, i, k, m, v, n, morphs, curMorph, curL, curV, curN, holder = [], checker = [],
            tester, nn, items = "", itser = "", index;
        inp = document.getElementById("vkn").value.trim();
        holder = [];
        lst = inp.split(" ");
        if (lst.length < 4) {
            alert("Give three numbers: length of nucleus, total length and number of occurrences");
            return;
        } else {
            kern = parseInt(lst[1]);
            laenge = parseInt(lst[2]);
            anzahl = parseInt(lst[3]);
            for (i = 0; i < storedDataLimit; i++) {
                morphs = StoredData[i].morphs;
                for (k = 1; k < morphs.length - 1; k++) {
                    m = morphs[k];
                    v = morphs[k - 1];
                    n = morphs[k + 1];
                    curMorph = MorphData[m];
                    curL = curMorph.laenge;
                    if (curL >= kern)
                        curV = MorphData[v].laenge;
                    curN = MorphData[n].laenge;
                    if ((curL + curV + curN) >= laenge) {
                        tester = v + " " + m + " " + n; // VKN
                        nn = holder[tester];
                        if (nn) {
                            holder[tester] = nn + 1; // holder ist ht von VKN
                        }
                        else {
                            holder[tester] = 1;
                        }
                    }
                }
            }
        }
        var textVals = [], yy, zz;
        for (index in holder) {
            if (holder[index] >= anzahl) {
                yy = index.split(" ");
                zz = yy[0] + " " + yy[2];
                if (!textVals[zz])
                    textVals[zz] = [];
                {
                    itser = index + " (" + holder[index] + ")" + '\n';
                    textVals[zz].push(itser);
                }
            }
        }
        var counter = 0
        for (index in textVals) {
            if (textVals[index].length != 1)
                items = items + (counter++ + "\t\t" + index + "\t(" + textVals[index].length + ")" + '\n');
        }


        document.getElementById("ChantList").value = items;
    }

// Suchmodus 5

    function makeSills(a, b) {
        this.num = a;
        this.vals = [b];
    }

    function sucheSilbenwerte() {
        var status = document.getElementById("silben").value, sills = sucheGleicheSilbenzahl(),
            corpus = document.getElementById("chantfam").value, gattung = document.getElementById("chantgattung").value;
        if (sills.length < 3)
            alert("Select a corpus and a genre");
        else {
            if ((isNaN(status)) || (status.length == 0)) {
                gibSilbenwerteAus(sills);
            } else {
                gibGleichlangeGesaenge(status, sills);
            }
        }

    }

    function gibGleichlangeGesaenge(status, sills) {
        var num = parseInt(status), chantNums = getChantNums(num, sills);
        organisiereGleichLangeGesaenge(num, chantNums);
    }

    function organisiereGleichLangeGesaenge(num, chantNums) {
        var w, item, starter, ender, isx, curOrte, absLaenge = chantNums.length, werte = [], i, vals;
        for (i = 0; i < chantNums.length; i++) {
            item = chantNums[i];
            {
                vals = new MorphPos(item, 0, [], item[3]);
                vals.kind = 6;
                werte.push(vals);
            }
        }
        isx = document.getElementById("seite").value;
        indices = "SM 6 " + document.getElementById("chantfam").value + " " + document.getElementById("chantgattung").value +
            " | Length of segment: " + document.getElementById("silben").value + " " + isx;
        starter = (isx * 20) - 20;
        ender = (isx * 20);
        if (starter > werte.length) {
            alert("There are not so many occurrences")
        } else {
            werte = werte.slice(starter, ender);
            macheAnzeige(absLaenge, "sillDisplay");
            curOrte = getSilbenWerte(num, chantNums, starter, ender);
            for (w = 0; w < werte.length; w++) {
                item = werte[w];
                item.orte = curOrte;
            }
            displayChantsWithSilbenstrecken(werte, starter);
        }
    }

    function getSilbenWerte(num, chantNums, starter, ender) {
        var holder = [], q, curChantNums = [], i, curNum, curInst, morphs, f, item, curMorph, curLength, orte = [], startVal = 230;
        for (q = 0; q < num; q++) {
            holder.push(0);
        }
        curChantNums = chantNums.slice(starter, ender);
        for (i = 0; i < curChantNums.length; i++) {
            curNum = curChantNums[i];
            curInst = StoredData[curNum];
            morphs = curInst.morphs;
            for (f = 0; f < morphs.length; f++) {
                item = morphs[f];
                curMorph = MorphData[item].morph.split(" ");
                curLength = (curMorph.length * 10) + 20;
                if (holder[f] < curLength)
                    holder[f] = curLength;
            }
        }
        for (i = 0; i < num; i++) {
            orte.push(startVal);
            startVal += holder[i];
        }
        return orte;
    }

    function getChantNums(num, sills) {
        var chantNums = [], i, item;
        for (i = 0; i < sills.length; i++) {
            item = sills[i];
            if (item.num === num) {
                chantNums = item.vals;
                break;
            }
        }
        return chantNums;
    }

    function gibSilbenwerteAus(sills) {
        var stringer = "", i, itemer, outer, k, q, curNum, curInst, curSills, yx, nexter;
        for (i = 0; i < sills.length; i++) {
            itemer = sills[i];
            if (itemer.vals.length >= 5) {
                stringer = stringer + '\n' + "Silbenzahl: " + itemer.num + " " + "Anzahl: " + itemer.vals.length + '\n' + '\n';
                outer = [];
                for (k = 0; k < itemer.vals.length; k++) {
                    curNum = itemer.vals[k];
                    curInst = StoredData[curNum];
                    curSills = fuegeSilbenZusammen(curInst.silben);
                    yx = (StoredData[curNum].titel + " " + "(" + StoredData[curNum].familie + " " + StoredData[curNum].gattung + " " + StoredData[curNum].edition + ")" + " " + i + '\n');
                    outer.push(yx);
                    outer.push(curSills + '\n');
                }
                outer.sort();
                nexter = "";
                for (q = 0; q < outer.length; q++) {
                    nexter = nexter + outer[q];
                }
                stringer = stringer + nexter;
            }
        }
        document.getElementById("ChantList").value = stringer;
    }

    function fuegeSilbenZusammen(sills) {
        var out = "", items = sills.split(" "), i, y;
        for (i = 0; i < items.length; i++) {
            y = items[i];
            if (y.substring(y.length - 1) == "-") {
                out = out + y.substring(0, y.length - 1);
            } else {
                out = out + y + " ";
            }
        }
        return out;
    }

    function sucheGleicheSilbenzahl() {
        var sillsStorer = [], counter = 0, holder = [], corpus = document.getElementById("chantfam").value,
            gattung = document.getElementById("chantgattung").value, sills, ll, n, its, item, i;
        for (i = 0; i < StoredData.length; i++) {
            item = StoredData[i];
            if ((item.familie == corpus) && (item.gattung.search(gattung) > -1)) {
                sills = item.silben.split(" ");
                ll = sills.length;
                n = holder[ll];
                if (n) {
                    sillsStorer[n].vals.push(i);
                } else {
                    holder[ll] = counter;
                    its = new makeSills(ll, i);
                    sillsStorer[counter] = its;
                    counter++;
                }
            }
        }
        return sillsStorer;
    }

// Suchmodus 6: Segmentsuche

    function makeSegment(a) {
        this.segment = a;
        this.count = 1;
        this.gattungen = [0, 0, 0, 0, 0, 0, 0, 0];
    }


    function sucheSegmente(vals) {
        var breite, anzahl, val, cfam, tester = true;
        cfam = document.getElementById("chantfam").value;
        document.getElementById("ChantList").value = "";
        if (cfam == "alle") {
            alert("Select a corpus: GR, AR oder ML.");
            tester = false;
        }
        if (tester) {
            val = vals.split(" ");
            if (val.length == 1) {
                breite = parseInt(val[0]);
            } else if (val.length == 2) {
                breite = parseInt(val[0]);
                anzahl = parseInt(val[1]);
            }
            organisiereSegmente(cfam, breite, anzahl);
        }
    }


    function organisiereSegmente(cfam, breite, anzahl) {
        var i, item, ht, breite, starter = 0, ender, segm, nx = [], nots, its, holder = [], counter = 0, num, out = "",
            noten, k, notser, str, cfam, gatter, cgat, orte, curLoc, cx, gatx, absx, absy, lx, seg;
        ht = giveNote();
        ender = breite;
        orte = ["Intr", "Ingr", "Alle", "Grad", "Psal", "Trac", "Comm", "Offe"];
        for (i = 0; i < StoredData.length; i++) {
            if (StoredData[i].familie == cfam) {
                cgat = StoredData[i].gattung;
                gatter = cgat.substring(0, 4);
                curLoc = orte.indexOf(gatter);
                nots = StoredData[i].noten.split(" ");
                for (k = 0; k < nots.length; k++) {
                    if (ht[nots[k]])
                        noten = noten + nots[k] + " ";
                }
                notser = noten.split(" ");
                while (ender < notser.length) {
                    segm = notser.slice(starter, ender).join(' ');
                    if (segm.indexOf("D") < 0) {
                        if (holder[segm]) {
                            num = holder[segm];
                            nx[num].count++;
                            nx[num].gattungen[curLoc]++;
                        }
                        else {
                            its = new makeSegment(segm);
                            holder[segm] = counter;
                            nx[counter] = its;
                            nx[counter].gattungen[curLoc]++;
                            counter++;
                        }
                    }
                    starter++;
                    ender++;
                }
            }
        }
        counter = 0;
        absx = '\t\t';
        absy = '\t\t\t';
        for (i = 0; i < nx.length; i++) {
            item = nx[i];
            if (item.count >= anzahl) {
                seg = item.segment.trim();
                lx = seg.length;
                cx = item.gattungen;
                gatx = "Intr: " + cx[0] + " Ingr: " + cx[1] + " All: " + cx[2] + " Grad: " + cx[3] + " Psal: " + cx[4] + " Tract: " + cx[5] + " Comm: " + cx[6] + " Off: " + cx[7];
                str = "Num: " + counter++ + ": " + absx + seg + absy + " Occ: " + item.count + " Distr: " + gatx + '\n';
                out = out + str;
            }
        }
        document.getElementById("ChantList").value = out.trim();
    }

// Utilities: allg. fcns für mehrere Moduln

    function btnColor(btn, color) {
        var property = document.getElementById(btn);
        if (property.style.backgroundColor == "#000000") {
            property.style.backgroundColor = Color;
        }
        else {
            property.style.backgroundColor = color;
        }
        replaceButtonText(btn, 'Loaded');
    }

    function replaceButtonText(buttonId, text) {
        var button;
        if (document.getElementById) {
            button = document.getElementById(buttonId);
            if (button) {
                button.innerHTML = text;
            }
        }
    }

    function giveNote() {
        var note = {
            "E": 78, "F": 75, "G": 72, "A": 69, "H": 66, "c": 63, "d": 60, "e": 57, "f": 54, "g": 51, "a": 48, "h": 45,
            "c'": 42, "d'": 39, "e'": 36, "f'": 33, "g'": 30, "a'": 27, "h'": 24, "c''": 21, "d''": 18
        };
        return note;
    }

    function giveIntervals() {
        var intervals = {
            "E": 0, "F": 1, "G": 3, "A": 5, "H": 7, "c": 8, "d": 10, "e": 12, "f": 13, "g": 15, "a": 17, "h": 19,
            "c'": 20, "d'": 22, "e'": 24, "f'": 25, "g'": 27, "a'": 29, "h'": 31, "c''": 32, "d''": 34
        };
        return intervals;
    }

    function giveTable() {
        var table = {
            "E": [], "F": [], "G": [], "A": [], "H": [], "c": [], "d": [], "e": [], "f": [], "g": [], "a": [],
            "h": [], "c'": [], "d'": [], "e'": [], "f'": [], "g'": [], "a'": [], "h'": [], "c''": [], "d''": []
        };
        return table;
    }

    function zaehleNoten() {
        var vals = {
            "E": 0, "F": 0, "G": 0, "A": 0, "H": 0, "c": 0, "d": 0, "e": 0, "f": 0, "g": 0, "a": 0,
            "h": 0, "c'": 0, "d'": 0, "e'": 0, "f'": 0, "g'": 0, "a'": 0, "h'": 0, "c''": 0, "d''": 0
        };
        return vals;
    }

    function gibMorphTitel() {
        var vals = {
            0: "GR Intr", 1: "GR Grad", 2: "GR Trac", 3: "GR Alle", 4: "GR Comm", 5: "GR Offe", 6: "AR Intr",
            7: "AR Grad", 8: "AR Tract", 9: "AR Alle", 10: "AR Comm", 11: "GR Offe", 12: "ML Psal", 13: "ML Ingr"
        };
        return vals;
    }

    function sucheMorphTitel() {
        var vals = {
            "GRIntr": 0, "GRGrad": 1, "GRTrac": 2, "GRAlle": 3, "GRComm": 4, "GROffe": 5, "ARIntr": 6, "ARGrad": 7,
            "ARTract": 8, "ARAlle": 9, "ARComm": 10, "GROffe": 11, "MLPsal": 12, "MLIngr": 13
        };

        return vals;
    }

    function corrCanvas() {
        var yNext, nexter, n, c, canvas, j, liner, dist, vals, curVal, starter, curInst, orte, curnum, sills, replSills, i, kind = 0, xl;
        vals = curReserveVals;
        if (vals.chantnum > -1) {
            starter = 0;
            kind = 1;
            curnum = vals.chantnum;
            curVal = StoredData[curnum];
            orte = findXValsOfChant(curnum);
            xl = 1;
        } else {
            vals = vals.vals;
            xl = vals.length;
        }
        n = prompt("Geben Sie die X-Koordinate", "100");
        if (n) {
            n = parseInt(n);
            liner = 59;
            dist = 150;
            canvas = document.getElementById("ausgabe");
            c = canvas.getContext("2d");
            c.font = '8pt Georgia, serif';
            c.clearRect(0, 0, n, canvasHeight);
            for (j = 0; j < xl; j++) {
                yNext = 100;
                if (kind == 0) {
                    curInst = vals[j];
                    curnum = parseInt(curInst.chantnum);
                    curVal = StoredData[curnum];
                    orte = curInst.orte;
                }
                sills = curVal.silben.split(" ");
                replSills = replaceItems(sills, orte, n);
                nexter = unterteiler(replSills);
                macheNotenlinien(c, n - 50, j, liner, dist, n);
                macheSchluessel(c, n + 10, j, liner, dist);
                c.fillText(j + 1, n - 200, j * dist + 25);
                displayTitel(c, curVal, j, dist, 0, starter, n - 200);
                for (i = 0; i < nexter.length; i++) {
                    c.fillText(nexter[i], n - 200, j * dist + yNext);
                    yNext += 15;
                }
            }
        }
    }


    function replaceItems(sills, orte, xPos) {
        var out = "", i, y, l, thePos, its, theStr, tester = false;
        for (i = 0; i < orte.length; i++) {
            its = orte[i];
            if (its >= xPos) {
                thePos = i;
                break;
            }
        }
        if (thePos != 0)
            theStr = sills.slice(0, thePos);
        else
            theStr = "";
        if (theStr.length > 0) {
            for (i = 0; i < sills.length; i++) {
                y = theStr[i];
                if (y) {
                    l = y.length - 1;
                    if (y.substring(l) == "-") {
                        out = out + y.substring(0, l);
                    } else {
                        out = out + y + " ";
                    }
                }
            }
            tester = theStr[thePos - 1];
            l = tester.length - 1;
            if (tester.substring(l) == "-")
                out = out + "-";
        }
        return out;
    }

    function unterteiler(str) {
        var holder = [], items, i, limit, out = "", ender;
        items = str.split(" ");
        limit = 20;
        ender = false;
        for (i = 0; i < items.length; i++) {
            out = out + items[i] + " ";
            ender = false;
            if (out.length > limit) {
                holder.push(out);
                ender = true;
                out = "";
            }
        }
        if (!ender)
            holder.push(out);
        return holder;
    }

    function macheAnzeige(num) {
        //Zeige die Anzahl der Funde
        var c = document.getElementById("ZeigeAnzahl"), ctx, w, h;
        ctx = c.getContext("2d");
        w = c.width;
        h = c.height;
        ctx.fillStyle = "lightblue";
        ctx.fillRect(0, 0, w, h);
        ctx.font = "84px Georgia, serif";
        ctx.fillStyle = "#000000";
        ctx.fillText(num, 50, 100);
    }

// Aufbau der Aehnlichkeitsfunktionen: die einzelnen Kriterien

    function bildeNumVals(num, morph, intervalle) {
        var tester = [];
        if (num == 1) {
            tester = bildePunkte(morph, intervalle);
        }
        else if (num == 2) {
            tester = bildeIsomorphien(morph, intervalle);
        }
        else if (num == 3) {
            tester = bildeGenaueKontur(morph, intervalle);
        } else {
            tester = bildeKontur(morph, intervalle);
        }
        return tester;
    }

    function bildeAusgangswerte(morph, intervalle) {
        var out = [], morphsplit = morph.split(" "), holdIt = [], tester = morphsplit[0], k, item;
        holdIt.push(morphsplit[0]);
        for (k = 1; k < morphsplit.length; k++) {
            item = morphsplit[k];
            if (item != tester) {
                holdIt.push(item);
                tester = item;
            }
        }
        for (i = 0; i < morphsplit.length; i++) {
            item = morphsplit[i];
            if (item.length > 0) {
                out.push(intervalle[item]);
            }
        }
        return out;
    }

    function bildeIsomorphien(morph, intervalle) {
        var zwischen = bildeAusgangswerte(morph, intervalle), out = [], i;
        for (i = 0; i < zwischen.length - 1; i++) {
            out.push(zwischen[i] - zwischen[i + 1]);
        }
        return out;
    }

    function bildePunkte(morph, intervalle) {
        var zwischen = bildeAusgangswerte(morph, intervalle), min = Math.min.apply(null, zwischen), max = Math.max.apply(null, zwischen),
            out = [zwischen[0], zwischen[zwischen.length - 1], max, min];
        return out;
    }

    function bildeGenaueKontur(morph, intervalle) {
        var zwischen = bildeAusgangswerte(morph, intervalle), vals = [], i, out, toTest1, toTest2, k;
        for (i = 0; i < zwischen.length - 1; i++) {
            vals.push(zwischen[i + 1] - zwischen[i]);
        }
        out = [];
        out.push(vals[0]);
        toTest1 = 0;
        if (vals[0] > 0)
            toTest1 = 1;
        else
            toTest1 = 0;
        toTest2 = 0;
        for (k = 1; k < vals.length; k++) {
            if (vals[k] > 0)
                toTest2 = 1
            else if (vals[k] < 0)
                toTest2 = 0;
            if (toTest1 != toTest2) {
                out.push(vals[k]);
                toTest1 = toTest2;
            }
        }
        return out;
    }

    function bildeKontur(morph, intervalle) {
        var kontur = bildeGenaueKontur(morph, intervalle), out = [], i, item;
        for (i = 0; i < kontur.length; i++) {
            item = kontur[i];
            if (item % 2 == 0)
                out.push(item);
            else
                out.push(item + 1);
        }
        return out;
    }


// Utilities für Notendarstellung

    function zeichneNote(canv, xVal, noteValue, shape, item, theDist, color) {
        var theLength = 3.8, theHeight = 2.8, folge, i, colors = ["#7fffd4", "#a52a2a", "#ff00ff", "#ff7f50", "#6495ed",
            "#00ff00", "#008080", "#e9967a"];
        if(axis != "")
        {
            colx = axis.achsenToene.indexOf(item);
            if(axis.zeigeFarben == 1)
                zeichneAchsenToene(canv, axis.achsenToene, colors);
            if(colx > 7)
                colx = 7;
            if(colx >= 0)
                coly = colors[colx];
            else
                coly = "#000000";
            canv.fillStyle = coly;
        }
        //canv.fillStyle = "#FFFFFF";
        if (shape === 0) {
            if (color == 1)
                canv.fillStyle = "#FF0000";
            else if (color == 2)
                canv.fillStyle = "#FFFFFF";
            canv.fillRect(xVal, noteValue, theLength, theHeight);
            if (color > 0)
                canv.strokeRect(xVal, noteValue, theLength + 1, theHeight + 1);
            else
                canv.strokeRect(xVal, noteValue, theLength, theHeight);
        } else if (shape === 1) {
            noteValue += 3;
            folge = [
                [xVal, noteValue + 2],
                [xVal, noteValue - theHeight - 2],
                [xVal + theLength, noteValue + 2],
                [xVal + theLength, noteValue - theHeight - 2]
            ];
            canv.beginPath();
            canv.lineWidth = 1.6;
            for (i = 0; i < folge.length; i++) {
                item = folge[i];
                if (i == 0) {
                    canv.moveTo(item[0], item[1]);
                } else if (i > 0) {
                    canv.lineTo(item[0], item[1]);
                    canv.moveTo(item[0], item[1]);
                }
            }
            canv.stroke();
        } else if (shape === 2) {
            item = [xVal, noteValue, xVal + theLength, noteValue];
            canv.fillRect(xVal, noteValue, theLength, theHeight);
            canv.strokeRect(xVal, noteValue, theLength, theHeight);
            canv.beginPath();
            canv.lineWidth = 0.7;
            canv.moveTo(item[0], item[1]);
            canv.lineTo(item[0], item[1] - 5);
            canv.moveTo(item[2], item[3]);
            canv.lineTo(item[2], item[3] - 10);
            canv.stroke();
        } else {
            item = [xVal, noteValue, xVal + theLength, noteValue];
            canv.fillRect(xVal, noteValue, theLength, theHeight);
            canv.strokeRect(xVal, noteValue, theLength, theHeight);
            canv.beginPath();
            canv.lineWidth = 0.7;
            canv.moveTo(item[0], item[1]);
            canv.lineTo(item[0], item[1] + 5);
            canv.moveTo(item[2], item[3]);
            canv.lineTo(item[2], item[3] + 10);
            canv.stroke();
        }
        if ((noteValue > 60) || (noteValue < 30)) {
            macheHilfslinien(noteValue, canv, item, xVal, theDist);
        }
        shape = 0;
        canv.lineWidth = 0.7;
        canv.fillStyle = "#000000";
    }

    function zeichneAchsenToene(canv, achsenToene, colors) {
        var i, x = 550, y = 10, betr = 12, adder = 30;
        for (i = 0; i < achsenToene.length; i++) {
            zeichneText(canv, achsenToene[i], x, y);
            x += adder;
            canv.fillStyle = colors[i];
            canv.fillRect(x, y, betr, betr);
            canv.fillStyle = "#000000";
            x += adder;
        }
    }

    function zeichneText(canv, txt, x, y)
    {
        canv.font = '10pt Verdana, serif';
        canv.fillStyle = "#000000";
        canv.fillText(txt, x, y+10);
    }

    function macheHilfslinien(noteValue, c, note, x, theDist) {
        var liner, howOften, i, val;
        if (noteValue > 60) {
            liner = {"E": 3, "F": 3, "G": 2, "A": 2, "H": 1, "c": 1};
            howOften = liner[note];
            val = 64;
            for (i = 0; i < howOften; i++) {
                c.beginPath();
                c.lineWidth = 0.6;
                c.moveTo(x - 3, val + theDist);
                c.lineTo(x + 6, val + theDist);
                c.stroke();
                val += 6;
            }
        } else {
            liner = {"a'": 1, "h'": 1, "c''": 2, "d''": 2};
            howOften = liner[note];
            val = 28;
            for (i = 0; i < howOften; i++) {
                c.beginPath();
                c.lineWidth = 0.6;
                c.moveTo(x - 3, val + theDist);
                c.lineTo(x + 6, val + theDist);
                c.stroke();
                val -= 6;
            }
        }
    }

    function macheSchluessel(c, x, line, liner, dist) {
        x -= 30;
        var theDist = line * dist;
        c.beginPath();
        c.lineWidth = 2;
        c.arc(x, 51 + theDist, 7, 0, 2 * Math.PI, true);
        c.moveTo(x, 80 + theDist);
        c.lineTo(x, 20 + theDist);
        c.stroke();
    }

    function macheNotenlinien(c, start, line, liner, dist, theWidth) {
        var theDist = line * dist, i;
        if (!theWidth)
            theWidth = canvasWidth + 20;
        c.beginPath();
        c.lineWidth = 2.5;
        c.moveTo(start - 10, liner + theDist + 2);
        c.lineTo(start - 10, (liner + theDist) - 26);
        c.stroke();
        for (i = 0; i < 5; i++) {
            c.beginPath();
            c.lineWidth = 0.5;
            c.moveTo(start - 10, liner + theDist);
            c.lineTo(theWidth, liner + theDist);
            c.stroke();
            liner -= 6;
        }
    }

    function displayTitel(c, chantInst, linie, dist, mode, adder, korrVal) {
        var newDist = linie * dist, firstVal;
        c.font = '8pt Georgia, serif';
        if (!korrVal)
            firstVal = 30;
        else
            firstVal = korrVal;
        c.fillText(chantInst.num, firstVal - 25, 40 + newDist);
        c.fillText(chantInst.titel, firstVal, 40 + newDist);
        c.fillText(chantInst.familie, firstVal, 55 + newDist);
        c.fillText(chantInst.gattung, firstVal, 70 + newDist);
        c.fillText(chantInst.edition, firstVal, 85 + newDist);
        if (mode == 1) {
            c.fillText(linie + 1 + adder, firstVal, 25 + newDist);
        }
        if ((linie == 0) && (zeigeIndices == 1))
            c.fillText(indices + " | " + timenow(), firstVal - 25, 12 + newDist);
    }

    function saveCanvas() {
        var imageData, w, h, canvas = document.getElementById("ausgabe");
        w = canvas.width;
        h = canvas.height;
        //imageData = canvas.toDataURL("image/png");
        imageData = macheHintergrund(canvas, w, h, 0);
        window.open(imageData, "toDataURL() image", w, h);
        imageData = macheHintergrund(canvas, w, h, 1);
    }

    function macheHintergrund(canvas, w, h, mode) {
        // Alphakanal in png einbauen
        var ctx = canvas.getContext("2d"), imageData;
        if (mode == 0) {
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = "#FFFFFF";
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = "#000000";
        }
        ctx.fillRect(0, 0, w, h);
        imageData = canvas.toDataURL("image/png");
        return imageData;

    }

// Utilities für Klick-fcns des SM 3


    window.onload = function () {
        var canvas;
        canvas = document.getElementById("ausgabe");
        canvas.onclick = processClick;
    }


    function processClick(evt) {
        // aus: JavaScript Cookbook, p. 119 (Shelley Powers, 2010)
        evt = evt || window.event;
        var x = 0, y = 0, offsetX, offsetY;
        if (evt.pageX) {
            x = evt.pageX;
            y = evt.pageY;
        } else if (evt.clientX) {
            offsetX = 0;
            offsetY = 0;
            if (document.documentElement.scrollLeft) {
                offsetX = document.documentElement.scrollLeft;
                offsetY = document.documentElement.scrollTop;
            } else if (document.body) {
                offsetX = document.body.scrollLeft;
                offsetY = document.body.scrollTop;
            }

            x = evt.clientX - offsetX;
            y = evt.clientY - offsetY;
        }


        zeichneKreise(x, y);

    }

    function zeichneKreise(x, y) {
        var c, j, item, val, corrX, corrY, rect, canvas;
        canvas = document.getElementById("ausgabe");
        rect = canvas.getBoundingClientRect();
        x = x - rect.left;
        y = y - rect.top;
        if (klickStart) {
            for (j = 0; j < klickVals.length; j++) {
                item = klickVals[j];
                val = item[1];
                if ((x > val - 8) && (x < val + 8)) {
                    klickStore.push(item);
                    corrX = val;
                    corrY = item[2];
                    break;
                }
            }
            if (canvas.getContext) {
                c = canvas.getContext("2d");
                c.beginPath();
                c.lineWidth = 2.5;
                c.strokeStyle = '#008000';
                c.arc(corrX + 1, corrY + 1, 5, 0, 2 * Math.PI, true);
                c.stroke();
                c.strokeStyle = '#000000';
            }
        }
    }

    function bildeFolge() {
        var sortVals = [], stored = [], j, curNum, k, testVal, nexter, str = "", item, mini = 100, maxi = 0, strnum;
        if (klickStore.length == 0) {
            alert("There are no clicked values");
        } else {
            for (j = 0; j < klickStore.length; j++) {
                item = klickStore[j];
                sortVals.push(item[0]);
            }
            sortVals.sort(function (a, b) {
                return a - b
            });
            for (k = 0; k < sortVals.length; k++) {
                testVal = sortVals[k];
                for (j = 0; j < sortVals.length; j++) {
                    nexter = klickStore[j];
                    if (nexter[0] == testVal) {
                        stored.push(nexter);
                        break;
                    }
                }
            }
            for (j = 0; j < stored.length; j++) {
                item = stored[j];
                str = str + item[3] + " ";
                if (item[0] < mini)
                    mini = item[0];
                if (item[0] > maxi)
                    maxi = item[0];
            }
            strnum = ((maxi - mini) + 1).toString();
            str = str + strnum;
            document.getElementById("folgen").value = str;
            klickVals = [];
            klickStart = false;
            klickStore = [];
        }
    }






}
/*
     FILE ARCHIVED ON 22:05:16 Sep 17, 2018 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 11:22:43 Sep 29, 2021.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 1309.171
  exclusion.robots: 0.097
  exclusion.robots.policy: 0.089
  RedisCDXSource: 1.881
  esindex: 0.009
  LoadShardBlock: 1285.213 (3)
  PetaboxLoader3.datanode: 249.906 (4)
  CDXLines.iter: 18.994 (3)
  load_resource: 99.063
  PetaboxLoader3.resolve: 36.096
*/
