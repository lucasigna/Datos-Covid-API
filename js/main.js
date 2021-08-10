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
    const loading = $('#loading');
    const selectPais = $("#selectPais");
    const selectTipoDeDato = $("#selectTipoDeDato");
    const selectTiempo = $("#selectTiempo");

    // Asigno los eventos para cuando se solicite otro gráfico
    selectPais.change( cambiarGrafico );
    selectTipoDeDato.change( cambiarGrafico );
    selectTiempo.change( cambiarGrafico );

    // Variable id del setInterval() para terminarlo cuando haya cargado el gráfico
    let idIntervalLoading;
    // Agrego los datos de casos y muertes en el top
    actualizarCasosYMuertes();
    // Relleno las opciones de paises en el select
    rellenarSelectPaises();
    // Muestro un indicador de carga de datos
    mostrarCargando();

    //! Funciones
    
    function mostrarCargando() {
        
        divLoading.show();
        let puntos = '';
            
        idIntervalLoading = setInterval( function() {

            loading.html(`Cargando${puntos}`);
            puntos = puntos.concat('.');
            if (puntos == '...') {
                puntos = '';
            }

        }, 1000);

    }

    function cambiarGrafico(event) {
        
        myChart.destroy();
        // Obtengo el día de hoy y pongo en el 00:00:00:000
        let fechaDeHoy = new Date();
        fechaDeHoy.setHours(-3);
        fechaDeHoy.setSeconds(0);
        fechaDeHoy.setMinutes(0);
        fechaDeHoy.setMilliseconds(0);
        let pais = selectPais.val();
        let dato = selectTipoDeDato.val();
        let tiempo = selectTiempo.val();
        let from = new Date(fechaDeHoy);
        switch (tiempo) {
            case 'all':
                mostrarDatosDePais(pais,'','',selectTipoDeDato.val());
                break;
            case '3':
                from.setMonth(fechaDeHoy.getMonth() - 3);
                mostrarDatosDePais(pais,from.toISOString(),fechaDeHoy.toISOString(),selectTipoDeDato.val());
                break;
            case '6':
                from.setMonth(fechaDeHoy.getMonth() - 6);
                mostrarDatosDePais(pais,from.toISOString(),fechaDeHoy.toISOString(),selectTipoDeDato.val());
                
                break;
            case '9':
                from.setMonth(fechaDeHoy.getMonth() - 9);
                mostrarDatosDePais(pais,from.toISOString(),fechaDeHoy.toISOString(),selectTipoDeDato.val());
                
                break;
            case '12':
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


            for (const country of json) {

                selectPais.append(`
                    <option class="option" value="${country['Slug']}">${country['Country']}</option>
                `);
                
            }
            mostrarDatosDePais(json[0]['Slug'],'','','casosConfirmados');
        });

    }

    function mostrarDatosDePais(pais, from, to, tipoDeDato) {
        
        mostrarCargando();
        switch (tipoDeDato) {
            case 'casosConfirmados':
                mostrarCasosConfirmados(pais,from,to);//! Terminado
                break;
            case 'casosDiarios':
                mostrarCasosDiarios(pais,from,to);//! Terminado
                break;
            case 'muertesConfirmadas':
                mostrarMuertesConfirmadas(pais,from,to);//? Casi Terminado
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
                    if (year == 2020) {
                        year = 20;
                    }
                    if (year == 2021) {
                        year = 21;
                    }
                    return `${meses[mes]} ${year}`;

                });
                dibujarGráfico(data, timeLabel);
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
                    if (year == 2020) {
                        year = 20;
                    }
                    if (year == 2021) {
                        year = 21;
                    }
                    return `${meses[mes]} ${year}`;

                });
                dibujarGráfico(data, timeLabel);
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
                    if (year == 2020) {
                        year = 20;
                    }
                    if (year == 2021) {
                        year = 21;
                    }
                    return `${meses[mes]} ${year}`;

                });
                dibujarGráfico(data, timeLabel);
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
                    if (year == 2020) {
                        year = 20;
                    }
                    if (year == 2021) {
                        year = 21;
                    }
                    return `${meses[mes]} ${year}`;

                });
                dibujarGráfico(data, timeLabel);
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
                    if (year == 2020) {
                        year = 20;
                    }
                    if (year == 2021) {
                        year = 21;
                    }
                    return `${meses[mes]} ${year}`;

                });
                dibujarGráfico(data, timeLabel);
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
                    if (year == 2020) {
                        year = 20;
                    }
                    if (year == 2021) {
                        year = 21;
                    }
                    return `${meses[mes]} ${year}`;

                });
                dibujarGráfico(data, timeLabel);
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
                    if (year == 2020) {
                        year = 20;
                    }
                    if (year == 2021) {
                        year = 21;
                    }
                    return `${meses[mes]} ${year}`;

                });
                dibujarGráfico(data, timeLabel);
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
                    if (year == 2020) {
                        year = 20;
                    }
                    if (year == 2021) {
                        year = 21;
                    }
                    return `${meses[mes]} ${year}`;

                });
                dibujarGráfico(data, timeLabel);
            })
            .catch( err => console.log(err) );

        }

    }

    function dibujarGráfico(data,time) {

        //myChart.destroy();
        clearInterval(idIntervalLoading);
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

                let casosInicio = casos-100;
                let muertesInicio = muertes-100;
                
                casosID.fadeIn('slow');
                casosID.slideDown('slow');
                muertesID.fadeIn('slow');
                muertesID.slideDown('slow');

                setInterval( function() {

                    if (casosInicio <= casos) {
                        casosID.html(agregarPuntos(casosInicio.toString()));
                        casosInicio++;   
                    }

                }, 0.1);

                setInterval( function() {

                    if (muertesInicio <= muertes) {
                        muertesID.html(agregarPuntos(muertesInicio.toString()));
                        muertesInicio++;   
                    }

                }, 0.1);

                //casosID.html(agregarPuntos(casos));
                //muertesID.html(agregarPuntos(muertes));

            });

    }

    function agregarPuntos(num) {
        return (
            num // always two decimal digits
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
        ) // use . as a separator
    }

});