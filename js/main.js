$(document).ready(function() {

    //! Variables y flujo principal

    // Array para mostrar los meses en el eje x
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

    const apiUrl = 'https://api.covid19api.com';
    const requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    let myChart;

    const ctx = $('#myChart');
    ctx.hide();// Escondo el gráfico hasta que cargue
    const divLoading = $('#divLoading');
    const selectPais = $("#selectPais");
    const selectTipoDeDato = $("#selectTipoDeDato");
    const selectTiempo = $("#selectTiempo");

    // Asigno los eventos para cuando se solicite otro gráfico
    selectPais.change( cambiarGrafico );
    selectTipoDeDato.change( cambiarGrafico );
    selectTiempo.change( cambiarGrafico );

    // Agrego los datos de casos y muertes en el top
    actualizarCasosYMuertes();
    // Relleno las opciones de paises en el select
    rellenarSelectPaises();
    // Muestro un indicador de carga de datos
    divLoading.show();
    divLoading.html('<p id="loading">Cargando...</p>');

    //! Funciones

    // Función que se ejecuta cada vez que se solicita otro gráfico
    function cambiarGrafico(event) {
        
        // Destruyo el gráfico para actualizarlo
        myChart.destroy();
        // Obtengo el día de hoy y pongo en el 00:00:00:000
        let fechaDeHoy = new Date();
        fechaDeHoy.setHours(-3);
        fechaDeHoy.setSeconds(0);
        fechaDeHoy.setMinutes(0);
        fechaDeHoy.setMilliseconds(0);
        // Obtengo el valor de los select
        let pais = selectPais.val();
        let dato = selectTipoDeDato.val();
        let tiempo = selectTiempo.val();
        let from = new Date(fechaDeHoy);
        switch (tiempo) {
            case 'all':
                mostrarDatosDePais(pais,'','',selectTipoDeDato.val());
                break;
            case '3':
                // Cambio la fecha de inicio a los meses correspondientes
                from.setMonth(fechaDeHoy.getMonth() - 3);
                mostrarDatosDePais(pais,from.toISOString(),fechaDeHoy.toISOString(),selectTipoDeDato.val());
                break;
            case '6':
                // Cambio la fecha de inicio a los meses correspondientes
                from.setMonth(fechaDeHoy.getMonth() - 6);
                mostrarDatosDePais(pais,from.toISOString(),fechaDeHoy.toISOString(),selectTipoDeDato.val());
                break;
            case '9':
                // Cambio la fecha de inicio a los meses correspondientes
                from.setMonth(fechaDeHoy.getMonth() - 9);
                mostrarDatosDePais(pais,from.toISOString(),fechaDeHoy.toISOString(),selectTipoDeDato.val());
                break;
            case '12':
                // Cambio la fecha de inicio a los meses correspondientes
                from.setMonth(fechaDeHoy.getMonth() - 12);
                mostrarDatosDePais(pais,from.toISOString(),fechaDeHoy.toISOString(),selectTipoDeDato.val());
                break;
            default:
                break;
        }

    }

    function rellenarSelectPaises() {

        fetch(`${apiUrl}/countries`)
        .then(response => response.json())
        .then( function(json) {

            // Ordeno los países alfabeticamente
            json.sort((a, b) => {
                let fa = a['Country'].toLowerCase(),
                    fb = b['Country'].toLowerCase();

                if (fa < fb) {
                    return -1;
                }
                if (fa > fb) {
                    return 1;
                }
                return 0;
            });
            // Imprimo en el select las opciones
            for (const country of json) {

                selectPais.append(`
                    <option class="option" value="${country['Slug']}">${country['Country']}</option>
                `);
                
            }
            mostrarDatosDePais(json[0]['Slug'],'','','casosConfirmados');
        });

    }

    function mostrarDatosDePais(pais, from, to, tipoDeDato) {
        
        ctx.hide();
        divLoading.show();
        divLoading.html('<p id="loading">Cargando...</p>');
        switch (tipoDeDato) {
            case 'casosConfirmados':
                mostrarCasosConfirmados(pais,from,to);
                break;
            case 'casosDiarios':
                mostrarCasosDiarios(pais,from,to);
                break;
            case 'muertesConfirmadas':
                mostrarMuertesConfirmadas(pais,from,to);
                break;
            case 'muertesDiarias':
                mostrarMuertesDiarias(pais,from,to);
                break;
            default:
                break;
        }

    }

    function mostrarCasosConfirmados(pais,from,to) {
        
        if (from != '' && to != '') {

            fetch(`${apiUrl}/country/${pais}/status/confirmed?from=${from}&to=${to}`)
            .then(response => response.json())
            .then( function(json) {
                let data = json.map((day) => { return day['Cases'] });
                let time = json.map((day) => { return new Date(day['Date'])  });
                let timeLabel = time.map( function(day) {
                    
                    let mes = day.getMonth();
                    let year = day.getFullYear();
                    let dia = day.getDate();
                    if (year == 2020) {
                        year = 20;
                    }
                    if (year == 2021) {
                        year = 21;
                    }
                    return `${dia} ${meses[mes]} ${year}`;

                });
                if (data.length == 0) {
                    // No hay datos, aviso al usuario
                    divLoading.html('<p id="loading">No hay datos</p>');
                } else {
                    dibujarGráfico(data, timeLabel);
                }
            })
            .catch( err => console.log(err) );

        } else {
            
            fetch(`${apiUrl}/dayone/country/${pais}`)
            .then(response => response.json())
            .then( function(json) {
                let data = json.map((day) => { return day['Confirmed'] });
                let time = json.map((day) => { return new Date(day['Date'])  });
                let timeLabel = time.map( function(day) { 
                    
                    let mes = day.getMonth();
                    let year = day.getFullYear();
                    let dia = day.getDate();
                    if (year == 2020) {
                        year = 20;
                    }
                    if (year == 2021) {
                        year = 21;
                    }
                    return `${dia} ${meses[mes]} ${year}`;

                });
                if (data.length == 0) {
                    // No hay datos, aviso al usuario
                    divLoading.html('<p id="loading">No hay datos</p>');
                } else {
                    dibujarGráfico(data, timeLabel);
                }
            })
            .catch( err => console.log(err) );

        }

    }
    
    function mostrarCasosDiarios(pais,from,to) {
        
        if (from != '' && to != '') {

            fetch(`${apiUrl}/country/${pais}/status/confirmed?from=${from}&to=${to}`)
            .then(response => response.json())
            .then( function(json) {
                let casosAyer = 0;
                let data = json.map( function(day) { 
                 
                    let confirmadosHoy = day['Cases'];
                    if (casosAyer == 0) {
                        casosAyer = confirmadosHoy;
                    }
                    let dif = confirmadosHoy - casosAyer;
                    if (dif < 0) {
                        dif = 0;
                    }
                    casosAyer = confirmadosHoy;
                    return dif;
                
                });
                let time = json.map((day) => { return new Date(day['Date'])  });
                let timeLabel = time.map( function(day) { 
                    
                    let mes = day.getMonth();
                    let year = day.getFullYear();
                    let dia = day.getDate();
                    if (year == 2020) {
                        year = 20;
                    }
                    if (year == 2021) {
                        year = 21;
                    }
                    return `${dia} ${meses[mes]} ${year}`;

                });
                if (data.length == 0) {
                    // No hay datos, aviso al usuario
                    divLoading.html('<p id="loading">No hay datos</p>');
                } else {
                    dibujarGráfico(data, timeLabel);
                }
            })
            .catch( err => console.log(err) );

        } else {
            
            fetch(`${apiUrl}/dayone/country/${pais}`)
            .then(response => response.json())
            .then( function(json) {
                let casosAyer = 0;
                let data = json.map( function(day) { 
                
                    let confirmadosHoy = day['Confirmed'];
                    if (casosAyer == 0) {
                        casosAyer = confirmadosHoy;
                    }
                    let dif = confirmadosHoy - casosAyer;
                    if (dif < 0) {
                        dif = 0;
                    }
                    casosAyer = confirmadosHoy;
                    return dif;
                
                });
                let time = json.map((day) => { return new Date(day['Date'])  });
                let timeLabel = time.map( function(day) { 
                    
                    let mes = day.getMonth();
                    let year = day.getFullYear();
                    let dia = day.getDate();
                    if (year == 2020) {
                        year = 20;
                    }
                    if (year == 2021) {
                        year = 21;
                    }
                    return `${dia} ${meses[mes]} ${year}`;

                });
                if (data.length == 0) {
                    // No hay datos, aviso al usuario
                    divLoading.html('<p id="loading">No hay datos</p>');
                } else {
                    dibujarGráfico(data, timeLabel);
                }
            })
            .catch( err => console.log(err) );

        }

    }
    
    function mostrarMuertesConfirmadas(pais,from,to) {
        
        if (from != '' && to != '') {

            fetch(`${apiUrl}/dayone/country/${pais}`)
            .then(response => response.json())
            .then( function(json) {

                let dataFiltrada = json.filter( function(day) { 
                
                    let fechaJson = new Date(day['Date']).getTime();
                    let fromDate = new Date(from).getTime();
                    let toDate = new Date(to).getTime();

                    if (fechaJson >= fromDate && fechaJson <= toDate) {
                        return day;    
                    }
                    
                });
                let data = dataFiltrada.map( function(day) { 
                
                    return day['Deaths'];    
                    
                });
                let time = dataFiltrada.map( function(day) { 
                
                    return new Date(day['Date']);  
                    
                });
                let timeLabel = time.map( function(day) { 
                    
                    let mes = day.getMonth();
                    let year = day.getFullYear();
                    let dia = day.getDate();
                    if (year == 2020) {
                        year = 20;
                    }
                    if (year == 2021) {
                        year = 21;
                    }
                    return `${dia} ${meses[mes]} ${year}`;

                });
                if (data.length == 0) {
                    // No hay datos, aviso al usuario
                    divLoading.html('<p id="loading">No hay datos</p>');
                } else {
                    dibujarGráfico(data, timeLabel);
                }
            })
            .catch( err => console.log(err) );

        } else {
            
            fetch(`${apiUrl}/dayone/country/${pais}`)
            .then(response => response.json())
            .then( function(json) {
                let data = json.map((day) => { return day['Deaths'] });
                let time = json.map((day) => { return new Date(day['Date'])  });
                let timeLabel = time.map( function(day) { 
                    
                    let mes = day.getMonth();
                    let year = day.getFullYear();
                    let dia = day.getDate();
                    if (year == 2020) {
                        year = 20;
                    }
                    if (year == 2021) {
                        year = 21;
                    }
                    return `${dia} ${meses[mes]} ${year}`;

                });
                if (data.length == 0) {
                    // No hay datos, aviso al usuario
                    divLoading.html('<p id="loading">No hay datos</p>');
                } else {
                    dibujarGráfico(data, timeLabel);
                }
            })
            .catch( err => console.log(err) );

        }

    }

    function mostrarMuertesDiarias(pais,from,to) {
        
        if (from != '' && to != '') {

            fetch(`${apiUrl}/dayone/country/${pais}`)
            .then(response => response.json())
            .then( function(json) {

                let dataFiltrada = json.filter( function(day) { 
                
                    let fechaJson = new Date(day['Date']).getTime();
                    let fromDate = new Date(from).getTime();
                    let toDate = new Date(to).getTime();

                    if (fechaJson >= fromDate && fechaJson <= toDate) {
                        return day;    
                    }
                    
                });
                let muertesAyer = 0;
                let data = dataFiltrada.map( function(day) { 
                
                    let muertesHoy = day['Deaths'];
                    if (muertesAyer == 0) {
                        muertesAyer = muertesHoy;
                    }
                    let dif = muertesHoy - muertesAyer;
                    if (dif < 0) {
                        dif = 0;
                    }
                    muertesAyer = muertesHoy;
                    return dif; 
                    
                });
                let time = dataFiltrada.map( function(day) { 
                
                    return new Date(day['Date']);  
                    
                });
                let timeLabel = time.map( function(day) { 
                    
                    let mes = day.getMonth();
                    let year = day.getFullYear();
                    let dia = day.getDate();
                    if (year == 2020) {
                        year = 20;
                    }
                    if (year == 2021) {
                        year = 21;
                    }
                    return `${dia} ${meses[mes]} ${year}`;

                });
                if (data.length == 0) {
                    // No hay datos, aviso al usuario
                    divLoading.html('<p id="loading">No hay datos</p>');
                } else {
                    dibujarGráfico(data, timeLabel);
                }
            })
            .catch( err => console.log(err) );

        } else {
            
            fetch(`${apiUrl}/dayone/country/${pais}`)
            .then(response => response.json())
            .then( function(json) {
                let muertesAyer = 0;
                let data = json.map( function(day) { 
                
                    let muertesHoy = day['Deaths'];
                    if (muertesAyer == 0) {
                        muertesAyer = muertesHoy;
                    }
                    let dif = muertesHoy - muertesAyer;
                    if (dif < 0) {
                        dif = 0;
                    }
                    muertesAyer = muertesHoy;
                    return dif; 
                    
                });
                let time = json.map((day) => { return new Date(day['Date'])  });
                let timeLabel = time.map( function(day) { 
                    
                    let mes = day.getMonth();
                    let year = day.getFullYear();
                    let dia = day.getDate();
                    if (year == 2020) {
                        year = 20;
                    }
                    if (year == 2021) {
                        year = 21;
                    }
                    return `${dia} ${meses[mes]} ${year}`;

                });
                if (data.length == 0) {
                    // No hay datos, aviso al usuario
                    divLoading.html('<p id="loading">No hay datos</p>');
                } else {
                    dibujarGráfico(data, timeLabel);
                }
            })
            .catch( err => console.log(err) );

        }

    }

    function dibujarGráfico(data,time) {

        divLoading.fadeOut('slow');
        ctx.fadeIn('slow');
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: time,
                datasets: [{
                    data: data,
                    fill: true,
                    borderColor: '#EFF6EE',
                    borderWidth: 1,
                    pointBorderWidth: 1,
                    backgroundColor: '#508AA8',
                    tension: 0.1,
                    pointStyle: 'circle',
                    pointRadius: 1.5,
                    
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    },
                },
                scales: {
                    legend: {
                        display: false,
                    },
                    y: {
                        grid: {
                            borderColor: '#EFF6EE'
                        }
                    },
                    x: {
                        grid: {
                            borderColor: '#EFF6EE'
                        }
                    }
                }
            },
        });

    }

    function actualizarCasosYMuertes() {
        
        fetch(`${apiUrl}/summary`)
            .then(response => response.json())
            .then( function(json) {

                let casosID = $("#casos");
                let muertesID = $("#muertes");
                casosID.hide();
                muertesID.hide();
                let casos = json['Global']['TotalConfirmed'];
                let muertes = json['Global']['TotalDeaths'].toString();
                // Agrego una animación de contador para que quede mejor
                let casosInicio = casos-100;
                let muertesInicio = muertes-100;
                
                casosID.fadeIn('slow');
                casosID.slideDown('slow');
                muertesID.fadeIn('slow');
                muertesID.slideDown('slow');

                let intervalCasos;
                intervalCasos = setInterval( function() {

                    if (casosInicio <= casos) {
                        casosID.html(agregarPuntos(casosInicio.toString()));
                        casosInicio++;   
                    } else {
                        clearInterval(intervalCasos);
                    }

                }, 0.1);

                let intervalMuertes;
                intervalMuertes = setInterval( function() {

                    if (muertesInicio <= muertes) {
                        muertesID.html(agregarPuntos(muertesInicio.toString()));
                        muertesInicio++;   
                    } else {
                        clearInterval(intervalMuertes);
                    }

                }, 0.1);

            });

    }
    // Función que agrega puntos a los números para mejorar la visibilidad del usuario
    function agregarPuntos(num) {
        return (
            num // always two decimal digits
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
        ) // use . as a separator
    }

});