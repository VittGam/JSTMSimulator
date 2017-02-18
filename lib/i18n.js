/*
 * JSTMSimulator - A Turing Machine simulator written in JavaScript.
 * Copyright (C) 2017 VittGam.net. All Rights Reserved.
 * https://www.turingsimulator.net/
 *
 * See https://www.turingsimulator.net/github for source code.
 *
 * Please see the attached LICENSE file for licensing information.
 */

var lang = {};
lang.en = {
	START_BUTTON: 'Start',
	STOP_BUTTON: 'Stop',
	SPEED_LABEL: 'Speed:',
	STEPS_LABEL: 'Steps:',
	STOPPED: 'End of computation.',
	UNKNOWN_ERROR_LABEL: 'Error:',
	SYNTAX_ERROR_LABEL: 'Syntax error at line %d:',
	READ_ERROR: 'A read error occurred',
	READ_ERROR_EXPECTED_COMMA: 'A "," was expected as separator',
	READ_ERROR_EMPTY_SOURCE_STATUS: 'A read error occurred while reading the source status',
	READ_ERROR_EMPTY_SOURCE_SYMBOL: 'A read error occurred while reading the source symbol',
	READ_ERROR_EMPTY_DESTINATION_STATUS: 'A read error occurred while reading the destination status',
	READ_ERROR_EMPTY_DESTINATION_SYMBOL: 'A read error occurred while reading the destination symbol',
	READ_ERROR_EMPTY_MOVEMENT: 'A read error occurred while reading the movement',
	READ_ERROR_WRONG_MOVEMENT: 'The movement is not correct',
	READ_ERROR_EMPTY_CHARACTER_CLASS: 'One of the character classes in the rule is empty',
	READ_ERROR_WRONG_CHARACTER_CLASS: 'The character classes in the rule are of different length',
	READ_ERROR_UNEXPECTED_END_OF_RULE: 'Unexpected end of rule',
	WARNING_ASCENDING_CHARACTER_CLASS: 'Warning: implicit ascending character classes (eg. "z..a") are not supported by the official simulator!\nWe suggest you to expand implicit ascending classes, for example "9..0" should become "9876543210".',
	WARNING_WONT_BE_SHOWN_AGAIN: 'This warning will not be shown again for this session.',
	EXIT_CONFIRMATION: 'Are you sure you want to exit?',
	LOAD_BUTTON: 'Load',
	SAVE_BUTTON: 'Save',
	LOAD_CONFIRMATION: 'Are you sure you want to load the program "{program_name}"?\n\nThe code in the box will not be saved if it has been modified after the last save, or if it has never been saved!\n\nAre you sure you want to load the program "{program_name}"?',
	LOAD_CONFIRMATION_NOSAVE: 'Are you sure you want to load the program "{program_name}"?\n\nThe code in the box will be overwritten!\n\nAre you sure you want to load the program "{program_name}"?',
	SAVE_CONFIRMATION: 'Are you sure you want to save the current program as "{program_name}" on the server?\n\nPrevious saves for "{program_name}" will be overwritten! Make sure you have selected the correct program!\n\nAre you sure you want to save the program "{program_name}"?',
	LOAD_RESULT_OK: 'Program loaded successfully from the server.',
	LOAD_RESULT_FAIL: 'An unknown error occurred while trying to load the program from the server. Please try again later.',
	SAVE_RESULT_OK: 'Program saved successfully on the server.',
	SAVE_RESULT_FAIL: 'An unknown error occurred while trying to save the program on the server. Please try again later.',
	USERNAME_LABEL: 'User:'
};
lang.it = {
	START_BUTTON: 'Esegui',
	STOP_BUTTON: 'Stop',
	SPEED_LABEL: 'Velocità:',
	STEPS_LABEL: 'Passi:',
	STOPPED: 'Fine della computazione.',
	UNKNOWN_ERROR_LABEL: 'Errore:',
	SYNTAX_ERROR_LABEL: 'Errore di sintassi (linea %d):',
	READ_ERROR: 'Errore nella lettura',
	READ_ERROR_EXPECTED_COMMA: 'Era attesa la "," come separatore',
	READ_ERROR_EMPTY_SOURCE_STATUS: 'Errore nella lettura dello stato di partenza',
	READ_ERROR_EMPTY_SOURCE_SYMBOL: 'Errore nella lettura del simbolo da leggere',
	READ_ERROR_EMPTY_DESTINATION_STATUS: 'Errore nella lettura dello stato di destinazione',
	READ_ERROR_EMPTY_DESTINATION_SYMBOL: 'Errore nella lettura del simbolo da scrivere',
	READ_ERROR_EMPTY_MOVEMENT: 'Errore nella lettura del movimento da eseguire',
	READ_ERROR_WRONG_MOVEMENT: 'Lo spostamento non è corretto',
	READ_ERROR_EMPTY_CHARACTER_CLASS: 'Una delle classi di caratteri nella regola è vuota',
	READ_ERROR_WRONG_CHARACTER_CLASS: 'Le classi di caratteri nella regola hanno lunghezze differenti',
	READ_ERROR_UNEXPECTED_END_OF_RULE: 'Fine inattesa della regola',
	WARNING_ASCENDING_CHARACTER_CLASS: 'Attenzione: ricorda che le classi di caratteri ascendenti implicite (ad es. "z..a") non sono supportate dal simulatore ufficiale!\nTi suggeriamo di espandere le classi ascendenti implicite, ad esempio "9..0" dovrebbe diventare "9876543210".',
	WARNING_WONT_BE_SHOWN_AGAIN: 'Questo avviso non verrà mostrato di nuovo per questa sessione.',
	EXIT_CONFIRMATION: 'Sei sicuro di voler uscire?',
	LOAD_BUTTON: 'Carica',
	SAVE_BUTTON: 'Salva',
	LOAD_CONFIRMATION: 'Sei sicuro di voler caricare il programma "{program_name}"?\n\nIl codice presente nella casella non verrà salvato se è stato modificato dall\'ultimo salvataggio, o se non è mai stato salvato!\n\nContinuare nel caricare il programma "{program_name}"?',
	LOAD_CONFIRMATION_NOSAVE: 'Sei sicuro di voler caricare il programma "{program_name}"?\n\nIl codice presente nella casella verrà sovrascritto!\n\nContinuare nel caricare il programma "{program_name}"?',
	SAVE_CONFIRMATION: 'Sei sicuro di voler salvare il programma corrente come "{program_name}" sul server?\n\nI salvataggi precedenti per "{program_name}" verranno sovrascritti! Assicurarsi di aver selezionato il programma corretto!\n\nContinuare nel salvare il programma "{program_name}"?',
	LOAD_RESULT_OK: 'Programma caricato con successo dal server.',
	LOAD_RESULT_FAIL: 'Si è verificato un errore sconosciuto durante il caricamento del programma dal server. Riprova più tardi.',
	SAVE_RESULT_OK: 'Programma salvato con successo sul server.',
	SAVE_RESULT_FAIL: 'Si è verificato un errore sconosciuto durante il salvataggio del programma sul server. Riprova più tardi.',
	USERNAME_LABEL: 'Utente:'
};
