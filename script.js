let map = L.map('map', {
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
    "دارک": darkmap,
       
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
    iconUrl: 'images/runmarker.png', 
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


var scaleControl = L.control.scale().addTo(map);



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
    show_routing(location.coords.latitude,location.coords.longitude,latLng.lat,latLng.lng)
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
        if (navigator.geolocation) {
            // شروع ردیابی موقعیت کاربر به صورت مداوم
            const watchId = navigator.geolocation.watchPosition(
                function(position) {
                    // ارسال موقعیت جدید به تابع resolve
                    resolve(position);
                },
                function(error) {
                    // در صورت بروز خطا، ارسال خطا به تابع reject
                    reject(error);
                },
                {
                    enableHighAccuracy: true, // درخواست دقت بالا
                    maximumAge: 0,            // استفاده نکردن از موقعیت قدیمی
                    timeout: 5000             // تایم‌اوت برای دریافت موقعیت
                }
            );
        } else {
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
};



/*------------------توابع------------------- */
let user_location_marker = null;
let activ_user_locatin = async () => {
    try {
        // ابتدا موقعیت اولیه کاربر را پیدا می‌کنیم
        let lat_lon = await location_user();
        
        // اضافه کردن نشانگر به نقشه با موقعیت اولیه کاربر
        user_location_marker = L.marker([lat_lon.coords.latitude, lat_lon.coords.longitude], {icon: marker_icon}).addTo(map);
        
        // حرکت نقشه به موقعیت کاربر
        map.flyTo([lat_lon.coords.latitude, lat_lon.coords.longitude], 16);

        // ردیابی موقعیت کاربر به صورت مداوم
        navigator.geolocation.watchPosition(function(position) {
            // به روزرسانی موقعیت نشانگر با موقعیت جدید
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            if (user_location_marker !== null) {
                user_location_marker.setLatLng([lat, lon]);
            }
            
        }, function(error) {
            console.error('موقعیت پیدا نشد:', error);  // در صورت خطا، پیام خطا را نمایش می‌دهیم
        }, {
            enableHighAccuracy: true, // دقت بالا
            maximumAge: 0,            // استفاده نکردن از موقعیت قدیمی
            timeout: 5000             // تایم‌اوت برای دریافت موقعیت
        });

    } catch (error) {
        console.error(error);
    }
};





let routeControl =null;
let show_routing = (MB_lat, MB_lon, MQ_lat, MQ_lon) => {
    if (routeControl) {
        // اگر کنترل مسیریابی از قبل ایجاد شده باشد، فقط مسیر را به‌روز می‌کنیم
        routeControl.setWaypoints([L.latLng(MB_lat, MB_lon), L.latLng(MQ_lat, MQ_lon)]);
    } else {
        // ایجاد کنترل مسیریابی جدید
        routeControl = L.Routing.control({
            waypoints: [L.latLng(MB_lat, MB_lon), L.latLng(MQ_lat, MQ_lon)],
            routeWhileDragging: false,  // مسیر هنگام کشیدن نمایش داده نمی‌شود
            showAlternatives: true,     // نمایش مسیرهای جایگزین
            fitSelectedRoutes: false,   // جابجایی نقشه به طور خودکار
            createMarker: function() {
                return null;  // جلوگیری از ایجاد نشانگر برای هر نقطه
            },
            lineOptions: {
                styles: [
                    { color: 'blue', weight: 8, opacity: 0.8 }
                ]
            },
            altLineOptions: {
                styles: [
                    { color: 'red', weight: 6, opacity: 0.5 }
                ]
            }
        }).addTo(map);
    }
    
    // رویداد routesfound: وقتی مسیر پیدا شد
    routeControl.on('routesfound', function(e) {
        // تنظیم نمای نقشه بر روی نقطه مبدا
        map.setView([MB_lat, MB_lon], 11);
        
        
        
        // فعال‌سازی دکمه برای شروع مسیریابی
        let startrunnav = document.getElementById('startrunnav');
        startrunnav.classList.remove("show");
        startrunnav.setAttribute("onclick", `run_navigator_user(${MQ_lat},${MQ_lon})`);

        // نمایش اطلاعات مسیریابی (اختیاری)
        // var route = e.routes[0];
        // console.log("طول مسیر: " + route.summary.totalDistance + " متر");
        // console.log("زمان تخمینی: " + route.summary.totalTime / 60 + " دقیقه");
        // console.log(route.instructions);
    });

    // رویداد routeselected: وقتی مسیری انتخاب می‌شود
    // routeControl.on('routeselected', function(e) {
    //     console.log('مسیری که انتخاب شد:', e);
    // });
};

let deleteNavigator = ()=>{
    // حذف کنترل مسیریابی از نقشه
    if (routeControl !== null && routeControl !== undefined) {
        map.removeControl(routeControl);  // حذف کنترل از نقشه
        routeControl = null;  // مقداردهی دوباره به null برای جلوگیری از مشکلات بعدی
    } else {
        console.log("Control is not defined or already removed");
    }
}







let startrunnav = null;
let endnav = null;
let user_navigator_location = null;


let run_navigator_user = async (MQ_lat, MQ_lon) => {
    try {
        // درخواست موقعیت کاربر
        let location = await location_user();

        // اگر نشانگر کاربر قبلاً وجود دارد، آن را حذف می‌کنیم
        if (user_location_marker) {
            map.removeLayer(user_location_marker);
            user_location_marker = null; // مقداردهی مجدد برای جلوگیری از مشکلات بعدی
        }

        // ایجاد یا به روزرسانی نشانگر موقعیت کاربر
        user_navigator_location = L.marker([location.coords.latitude, location.coords.longitude], {icon: navigator_icon}).addTo(map);

        // اگر routeControl قبلاً ایجاد شده باشد، فقط مسیر را به روز می‌کنیم
        if (routeControl) {
            routeControl.setWaypoints([L.latLng(location.coords.latitude, location.coords.longitude), L.latLng(MQ_lat, MQ_lon)]);
        } else {
            // ایجاد کنترل مسیریابی جدید
            routeControl = L.Routing.control({
                waypoints: [L.latLng(location.coords.latitude, location.coords.longitude), L.latLng(MQ_lat, MQ_lon)],
                routeWhileDragging: true,
                createMarker: function () {
                    return null; // عدم نمایش مارکرها
                },
                lineOptions: {
                    styles: [
                        { color: 'blue', weight: 8, opacity: 0.6 }
                    ]
                },
                fitSelectedRoutes: false
            }).addTo(map);
        }
        // تغییر متن دکمه
        startrunnav = document.getElementById('startrunnav');
        startrunnav.classList.add("show");
        endnav = document.getElementById('endrunnav');
        endnav.classList.remove('show')
        
 
        map.setZoom(22);
        let speedusernumber = document.getElementById('speedUser');
        // پیگیری موقعیت کاربر
        navigator.geolocation.watchPosition(function(position) {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            var userLatLng = L.latLng(lat, lon);


            // به روزرسانی موقعیت نشانگر
            user_navigator_location.setLatLng([lat, lon]);
            //routeControl.setWaypoints([L.latLng(lat, lon), routeControl.getWaypoints()[1]]);
            // map.panTo([lat, lon]);

            // var routePlan = routeControl.getPlan();

            // var nearestPoint = L.GeometryUtil.closest(map, routePlan, userLatLng);
            

            // if (closest) {
            //     const closestLatLng = map.layerPointToLatLng(nearestPoint);
            //     user_navigator_location.setLatLng(closestLatLng);
            // }



            if (routeControl._routes && routeControl._routes.length > 0) {
        const route = routeControl.getRoutes()[0];  // گرفتن اولین مسیر
        const polyline = route.getRoute()._layers[Object.keys(route.getRoute()._layers)[0]]; // گرفتن لایه Polyline مسیر
        const latlngs = polyline.getLatLngs();  // گرفتن آرایه نقاط مسیر
                
                let closestLatLng = null;
                let minDistance = Infinity;
        
                for (let i = 0; i < latlngs.length - 1; i++) {
                    const p1 = latlngs[i];
                    const p2 = latlngs[i + 1];
                    const closestPointOnSegment = L.GeometryUtil.closest(map, [p1, p2], userLatLng);
                    const distance = L.GeometryUtil.distance(map, userLatLng, closestPointOnSegment);
        
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestLatLng = closestPointOnSegment;
                    }
                }
        
                if (closestLatLng) {
                    user_navigator_location.setLatLng(closestLatLng);
                }
            }






            
            speedusernumber.innerHTML = Math.floor(position.coords.speed * 3.6)
            if (position.coords.heading !== null) {
                userMarker.setRotationAngle(position.coords.heading);
                map.setBearing(-position.coords.heading);
            }



        }, function(error) {
            console.error("خطا در دریافت موقعیت:", error);
            alert("خطا در دسترسی به موقعیت مکانی. ممکن است دسترسی غیرفعال باشد.");
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });

    } catch (error) {
        console.error('خطا در اجرای تابع:', error);
    }
};



let delete_run_navigator_user = () => {
    if (user_navigator_location !== null) {
        map.removeLayer(user_navigator_location);
        user_navigator_location = null;
    }

    map.setZoom(10);

    startrunnav.classList.remove('show')
    endnav.classList.add('show')

    
}
















/* ----------------- افزودن دکمه روی نقشه ------------------ */
var customControl = L.Control.extend({
    options: {
        position: 'bottomright'
    },

    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'custom-control');
        container.innerHTML = '<button onclick="activ_user_locatin()" class="gps_button">م8کان</button><button id="startrunnav" class="show">شروع</button><button id="endrunnav" onclick="delete_run_navigator_user()" class="show">پایان</button><h1 id="speedUser">0</h1>';
        return container;
    }
});
map.addControl(new customControl());
