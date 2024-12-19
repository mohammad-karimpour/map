869let map = L.map('map', {
    center: [36.127,45.633],
    zoom: 6,
    rotate: true,
    touchRotate: true,
});




/* -------  لایه ها  ---------*/
let osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let darkmap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png').addTo(map);
let whitemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png').addTo(map);
let satelliteLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png').addTo(map);

let baseLayers = {
    "نرمال": osmLayer,
    'سفید': whitemap,
    "ماهواره ای" : satelliteLayer,
    "دارک": darkmap
       
};
L.control.layers(baseLayers).addTo(map);





/* ---------------- تنظیمات نشانگر ها --------------- */

let location_icon = L.icon({
    iconUrl: 'images/P-marker.svg',  // مسیر تصویر آیکن
    iconSize: [30, 30],  // اندازه آیکن
    iconAnchor: [15, 15],  // نقطه‌ای که نشانگر به آن متصل می‌شود
    popupAnchor: [-3, -76],  // موقعیت پنجره‌ی پاپ‌آپ نسبت به آیکن
});
let marker_icon = L.icon({
    iconUrl: 'images/marker.png', 
    iconSize: [30, 30],  
    iconAnchor: [15, 15],  
    popupAnchor: [-3, -76],  
});
let navigator_icon = L.icon({
    iconUrl: 'image/runmarker.png', 
    iconSize: [30, 30],  
    iconAnchor: [15, 15],  
    popupAnchor: [-3, -76], 
});






/* ------------------ آپشن ها ----------------- */

// افزودن جستجوگر مکان
L.Control.geocoder({
    collapsed: true,
    position: 'topright',
    placeholder: 'یک مکان جست وجو کن',
    defaultMarkGeocode: true
}).on('markgeocode', function(event) {
    map.flyTo([event.geocode.center.lat,event.geocode.center.lng], 12);
}).addTo(map);




let contextMenu = document.getElementById('contextMenu');
var latLng = null;
map.on('contextmenu', function(event) {
    latLng = event.latlng;
    
    // موقعیت مکانی منو را تنظیم می‌کنیم
    contextMenu.style.left = event.originalEvent.pageX + 'px';
    contextMenu.style.top = event.originalEvent.pageY + 'px';

    // نمایش منو
    contextMenu.style.display = 'block';

    // جلوگیری از نمایش منوی پیش‌فرض مرورگر
    event.originalEvent.preventDefault();
});
var touchTimeout;
map.on('touchstart', function(event) {
    latLng = event.latlng; 
    // زمان تاخیر برای شبیه‌سازی لمس و نگه‌داشتن
    touchTimeout = setTimeout(function() {
        var touch = event.touches[0];
        event.preventDefault();

        contextMenu.style.left = touch.clientX + 'px';
        contextMenu.style.top = touch.clientY + 'px';
        contextMenu.style.display = 'block';
    }, 500); // 500 میلی‌ثانیه تاخیر
});

map.on('touchend', function(event) {
    clearTimeout(touchTimeout); // اگر کاربر دست خود را برداشت، تایمر لغو شود
});

// بستن منو هنگام کلیک در خارج از منو
window.addEventListener('click', function(event) {
    if (!contextMenu.contains(event.target)) {
        contextMenu.style.display = 'none';
    }
});


let opennavigatorbox = ()=>{
    let navigatorbox = document.getElementById('navigatorbox');
    navigatorbox.classList.remove("show");
}





let of_MQ_navigator = ()=>{
    opennavigatorbox()
    let mabdasearchInput = document.getElementById('mabdasearchinput');
    let maqsadsearchInput = document.getElementById('maqsadsearchinput');
    let searchbutton = document.getElementById('searchbutton');
    let geocoder = L.Control.Geocoder.nominatim();
    searchbutton.addEventListener('click',()=>{
        if (mabdasearchInput.value.length < 3) {
            console.log('لطفا نام مکان را وارد کن.');
        }else{
           geocoder.geocode(mabdasearchInput.value,(results)=> {
              let makanDiv = document.getElementById('makans')
              makanDiv.innerHTML = "";
              results.forEach((M) => {
                let makansList = document.createElement('h3');
                makansList.innerHTML =  M.html
                makansList.setAttribute("id", "makanItems");
                makansList.setAttribute("onclick", `AddMB(${M.center.lat},${M.center.lng},'${M.properties.display_name}')`);
                makanDiv.appendChild(makansList);
              });
              console.log(results);
           });
        }
    })
}

let AddMB = (lat,lng,name)=>{
    map.flyTo([lat,lng], 12);
    let makanmarker = L.marker([lat, lng], {icon: marker_icon}).bindPopup(name).addTo(map).openPopup();
    let navigatorbutton = document.getElementById('startnav');
    navigatorbutton.setAttribute("onclick", `show_routing(${lat},${lng},${latLng.lat},${latLng.lng})`);
    navigatorbutton.classList.remove("show");
    let navigatorbox = document.getElementById('navigatorbox');
    navigatorbox.appendChild(navigatorbutton);
}



let GPSnav = async ()=>{
    let location = await location_user()
    show_routing(location.lat,location.lng,latLng.lat,latLng.lng)
}








document.getElementById('copyCoords').addEventListener('click', function() {
    if (latLng) {
        var coords = `Latitude: ${latLng.lat}, Longitude: ${latLng.lng}`;
        navigator.clipboard.writeText(coords).then(function() {
            alert("مختصات کپی شد: " + coords);
        }).catch(function(err) {
            alert('خطا در کپی کردن مختصات: ' + err);
        });
    } else {
        alert('لطفاً روی نقشه کلیک راست کنید');
    }

    // مخفی کردن منو پس از انتخاب گزینه
    contextMenu.style.display = 'none';
});;












/* ----------------- داده ها ----------------- */
let location_user = () => {
    return new Promise((resolve, reject) => {
        map.locate({ setView: true, maxZoom: 16 });
        
        map.on('locationfound', function(e) {
            // Resolve the promise with latitude, longitude, and accuracy (radius)
            resolve({
                lat: e.latlng.lat,     // عرض جغرافیایی (latitude)
                lng: e.latlng.lng,     // طول جغرافیایی (longitude)
                accuracy: e.accuracy   // دقت موقعیت (radius)
            });
        });
        
        map.on('locationerror', function(e) {
            // Reject the promise if there's an error
            reject('موقعیت پیدا نشد.');
        });
    });
};














/* ----------------- توابع ----------------- */
let activ_user_locatin = async  ()=>{
    let lat_lon = await  location_user()
    user_location_marker = L.marker([lat_lon.lat, lat_lon.lng], {icon: marker_icon}).addTo(map);
    map.flyTo([lat_lon.lat, lat_lon.lng], 16);
    setInterval(() => {
        user_location_marker.setLatLng([lat_lon.lat, lat_lon.lng]); 
    }, 10);
}

let routeControl =null;
let show_routing = (MB_lat,MB_lon,MQ_lat,MQ_lon)=>{
    if (routeControl) {
        routeControl.setWaypoints([[MB_lat,MB_lon], [MQ_lat,MQ_lon]]); 
    }else{
    routeControl = L.Routing.control({
        waypoints: [L.latLng(MB_lat,MB_lon), L.latLng(MQ_lat,MQ_lon)],
        routeWhileDragging: false,
        showAlternatives: true,
        fitSelectedRoutes: false,
        createMarker: function() {
            return null;
        },
        lineOptions: {
            styles: [
                { color: 'blue', weight: 8, opacity: 0.8 }
            ]
        }, 
        altLineOptions:{
            styles: [
                { color: 'red', weight: 6, opacity: 0.5 }
            ]
        },                      
    }).addTo(map);
}
    routeControl.on('routesfound', function(e) {
        map.setView([MB_lat, MB_lon], 8);
        MAB_marker = L.marker([MB_lat, MB_lon], {icon: marker_icon}).addTo(map);
        MAQ_marker = L.marker([MQ_lat, MQ_lon], {icon: marker_icon}).addTo(map);
        console.log( e);


         
        // var route = e.routes[0];
        // console.log("مسیر پیدا شده: ");
        // console.log("طول مسیر: " + route.summary.totalDistance + " متر");
        // console.log("زمان تخمینی: " + route.summary.totalTime / 60 + " دقیقه");
        // console.log("مسیری که باید طی کنید: ");
        // console.log(route.coordinates)
        // console.log("مسیر با نوع وسیله نقلیه: ", route.instructions)
        // console.log("محدوده زمان تخمینی: ", route.summary.totalTime);
        // console.log("مسیر با مراحل مختلف: ", route.steps);

        let startrunnav = document.getElementById('startrunnav');
        startrunnav.classList.remove("show");
        startrunnav.setAttribute("onclick", `run_navigator_user(${MB_lat},${MB_lon})`);

        // var instructionsHtml = "<h3>دستورالعمل‌ها:</h3>";

        // route.instructions.forEach(function(step, index) {
        //     instructionsHtml += "<p>" + (index + 1) + ". " + step.text + "</p>";
        // });

        // document.getElementById("instructions").innerHTML = instructionsHtml;
    });
    routeControl.on('routeselected', function(e) {
        console.log(e);
        
    }); 

}






let run_navigator_user = async (MQ_lat,MQ_lon)=>{
    let locatiton = await location_user()
    map.on('locationfound', function(e) {
        if (MAB_marker) {
            map.removeLayer(MAB_marker);
        }
        let user_navigator_location = L.marker([locatiton.lat, locatiton.lng], {icon: navigator_icon}).addTo(map);
        map.flyTo([U_lat,U_lon], 18)
        if (routeControl) {
            routeControl.setWaypoints([[locatiton.lat, locatiton.lng], [MQ_lat,MQ_lon]]); 
        } else {
            routeControl = L.Routing.control({
                waypoints: [L.latLng(locatiton.lat, locatiton.lng), L.latLng(MQ_lat,MQ_lon)],
                routeWhileDragging: false,
                createMarker: function() {
                    return null;
                },
                lineOptions: {
                    styles: [
                        { color: 'blue', weight: 8, opacity: 0.6 }
                    ]
                },        
                fitSelectedRoutes: false                 
                      }).addTo(map);

        }
        setInterval(()=>{
            routeControl.setWaypoints([[locatiton.lat, locatiton.lng], [MQ_lat,MQ_lon]]);
            let L_ine = routeControl.getRoute().closestPoint(locatiton);
            user_navigator_location.setLatLng(L_ine.latLng);
        },10)
    })
    map.on('locationerror', function(e) {
        alert("خطا در دسترسی به موقعیت مکانی. ممکن است دسترسی غیرفعال باشد." + e);
    });
}























/* ----------------- افزودن دکمه روی نقشه ------------------ */
var customControl = L.Control.extend({
    options: {
        position: 'bottomright'
    },

    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'custom-control');
        container.innerHTML = '<button onclick="activ_user_locatin()" class="gps_button">vمک#ان</button><button id="startrunnav" class="show">شروع</button>';
        return container;
    }
});
map.addControl(new customControl());
