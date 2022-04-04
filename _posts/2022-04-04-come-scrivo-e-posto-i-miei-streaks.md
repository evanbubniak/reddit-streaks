---
layout: post
title: Come scrivo e posto i miei streaks
categories: [it]
lang: it
date: 2022-04-04
published: true
streak-number: 6
reddit-url:
---
Ciao a tutti,

Avevo menzionato nella sezione commenti di uno streak anteriore sul processo di installazione di Ubuntu su un computer vecchio che ho scritto quel post (infatti come tutti i miei post) con l'editore di testo Vim. Inoltre avevo suggerito che potrei scrivere un post che ne spiega i dettagli. Allora sarà in questo post che dettagliarò come faccio i miei post qui.

Per chi non conosce cos'è GitHub, è un sito per ospitare progetti sotto il sistema di controllo di versione Git. Per la maggioranza si questi progetti, si tratta di codice sorgente per progetti di software. Ma più generalmente, è possibile usare Git per qualsiasi progetto che ha documenti scritti in testo puro, tanto per organizzare la storia delle varie revisioni del progetto come per distribuare i file contenuti in una qualsiasi revisione.

In questo caso, il repository che ho inizializzato per il "progetto" per i miei streaks contiene i post che ho scritti, nel format di testo puro Markdown, lo stesso format che Reddit (o almeno Old Reddit alla mia conoscenza, non so se si usa un'altro format per New Reddit) usa per i suoi commenti. Inoltre i file Markdown possiedono metadati davanti al contenuto dell'articolo; questi metadati si chiamano "front matter" e possono includere dati come il titolo, l'auttore, la data di pubblicazione, la lingua, ed altri dati arbitrari che appartengono al post.

Posso sincronizzare i file contenuti in questo repository, e la loro storia di revisione, entre GitHub e qualsiasi apparecchio, allora potrei scrivere un post nella cartella per i post su un computer e dopo sincronizzare i cambiamenti verso GitHub con un'azione chiamata "push".

GitHub offrisce due servizi al di là del ospitare i file per i miei post che uso per pubblicarli: con il primo servizio, GitHub Pages, posso publiccare quei post come pagine su un sito statico, ovvero un sito che non ha bisogna di database o codice server dinamico, come un blog. Ogni volta che aggiungo o modifico un post o un'altra pagina relazionata al sito (come la pagina iniziale), il sito verrà attualizzato.

Il secondo servizio, GitHub Actions, mi consente definire degli script e programmi che GitHub lanciarà in risposta a certi eventi, ad esempio quando faccio un "push" per aggiungere nuovi contenuti o modificare contenuti sul sito, o quando ho già fatto un push e GitHub determina che i contenuti del sito verrano attualizati.

Allora, quando voglio scrivere un post, creo un nuovo file con Vim e genero il frontmatter con il titolo, la lingua, la data, se sono pronto o non a pubblicarlo, il numero dello streak, e lascio un campo finale vuoto: il `reddit-url`. Sotto il frontmatter scrivo il testo del post. Uso UltiSnips, un'extensione per Vim, per generare il modello del frontmatter scrivendo solo `startstreak` al capo; posso selezzionare i campi pulsando `Tab` ed aggiungere i valori che voglio.

Quando ho finito il testo e sono pronto a postarlo, cambio il valore del campo "published" a "true", e lascio il campo `reddit-url` vuoto. Poi aggiungo il file al mio prossimo "commit" (revisione del repository), confermo il commit, e faccio il push verso GitHub, il che causa l'attualizzazione del sito (questo evento viene chiamato `page_build`), il che lanciarà automaticamente uno script da GitHub Actions.

Questo script cerca post che hanno un valore di "true" nel campo `published` ma che non hanno tuttavia un valore nel campo `reddit-url`, ciò che significa che il post non è ancora stato pubblicato. Per quale post che riempe questa condizione, lo script posta il post su Reddit attraverso l'API di Reddit usando il mio nome utente, il mio password, un codice identità ed una chiave API, che vengono salvati su GitHub come "segreti" nel repository. Dopo aver confermato che il post è su Reddit, lo script aggiunge il link nel campo `reddit-url`, fa un nuovo commit, e fa un nuovo push al repository GitHub.

Così non ho bisogno di aprire Reddit per postare i miei streaks. Come potete immaginnare, non risparmio molto tempo facendo questo. Ma mi consente comporre i miei post con Vim senza dovere aprire il browser, il che mi importa di più.
