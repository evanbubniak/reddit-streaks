---
layout: post
title: Installazione Ubuntu su computer vecchio
categories: [it]
lang: it
date: 2022-03-30
published: true
streak-number: 2
reddit-url: https://www.reddit.com/r/WriteStreakIT/comments/ts9s30/streak_2_installazione_ubuntu_su_computer_vecchio/
---
Iersera ho passato qualche ora ad installare Ubuntu sul computer portatile Windows vecchio di mio zio. L'installazione è stato un successo e, nonostante la sua... età avanzata, funziona senza problemi.  Adesso, ho scritto questo posto su quel computer sotto Ubuntu, sul editor di testo Vim.

Non si tratta della prima volta che installi Ubuntu su un computer, ma perché lo faccio abitualemente solo una volta tutti i 3-4 anni, ad ogni volta non ricordo più che fare e devo consultare la documentazione e qualche tutorial per ricordarmi dei passi da seguire. Normalmente, non uso spesso l'interfaccia grafica di Ubuntu (ad essere preciso, invece uso spesso  WSL sotto Windows, il chi funge da terminale Ubuntu a funzionalità piena e con un filesystem proprio), allora ho notato qualche cambio importante familiarizzandomi - ad esempio, il supporto per metodi di input per il giaponnese ed il cinese è stato ampliamente migliorato.

Allora, come ho fatto per installare Ubuntu? I grandi passi che ho fatto iersera sono così:

- Creare un backup
- bruciare due immagini di disco (su un disco se il computer ha un lettore di disco, come questo, o altrimenti su una pen-drive USB): una per l'immagine di Ubuntu chi verrà installata sul computer, ed una per l'immagine del programma GParted che partizionarà il disco fisso e crearà lo spazio dove verrà installato Ubuntu.
- Fare spazio vuoto sul computer con il programma Windows DISKPART (Ho fatto all'intorno di 130 GB, parzialmente eliminando la partizione recovery)
- inserire il disco GParted nel lettore di DVD (o la pen-drive nella porta USB)
- reiniziare il computer con un dito pulsando il pulsante ESCAPE
- Quando vedi il menù startup, apri le opzioni boot e seleziona il disco DVD o la pen-drive USB
- riarrangiare le partizioni sul disco duro per avere spazio vuoto contiguo
- inserire il disco Ubuntu, e clicca su "install ubuntu", scegli le opzioni di installazione ai tuoi gusti
- Quando devi scegliere se vuoi rimpiazzare il sistema operativo attualmente installato, clicca su "Something else"
- Creare una partizione logica SWAP di almeno 8GB nello spazio vuoto
- Creare una partizione primaria montata sulla cartella root (ovvero "/") con lo spazio rimanente
- Confermare le tue scelte e inizia l'installazione

Dopo, il sistema operativo Ubuntu dovrebbe essere completamente installato. Dovresti creare e configurare un profilo con nome utente e parola chiave, e vorresti probabilmente fare altre cose dopo, ad esempio lanciare i comandi `sudo apt-get upgrade`, `sudo apt install vim`, `sudo apt install git` etc. per installare i tuoi programmi preferiti.