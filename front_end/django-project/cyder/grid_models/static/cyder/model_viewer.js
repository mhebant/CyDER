function getJSON(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = function() {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(xhr);
            }
        };
        xhr.send();
    });
}

async function showGeojsonLayer(obj) {
    if(!obj || !obj.geojsonLayer)
        return;
    if(obj.geojsonLayer instanceof Promise)
        await obj.geojsonLayer;
    if(this.isDestroyed)
        return;
    obj.geojsonLayer.addTo(modelViewer.leafletMap);
    modelViewer.leafletMap.fitBounds(obj.geojsonLayer.getBounds());
}
function hideGeojsonLayer(obj) {
    if(!obj || !obj.geojsonLayer || obj.geojsonLayer instanceof Promise)
        return;
    obj.geojsonLayer.remove();
}

Vue.component('allmodels', {
    template:
        `<div>
            <div v-for="model in models">
                <br>
                <button class="btn btn-primary btn-sm"
                    v-on:click=""
                    >Open</button>
            </div>
        </div>`,
    props: ['models'],
    created() {
        this.createGeojsonLayer(this.models);
        this.showGeojsonLayer(this.models);
    },
    destroyed() {
        this.isDestroyed = true;
        this.hideGeojsonLayer(this.models);
    },
    methods: {
        showGeojsonLayer,
        hideGeojsonLayer,
        createGeojsonLayer(models) {
            if (!models || models.geojsonLayer)
                return;

            models.geojsonLayer = (async () => {
                let geojson = await getJSON('/api/models/geojson');
                let onEachFeature = function(feature, layer) {
                    let popup = document.createElement('div');
                    popup.innerHTML =
                        `${feature.properties.modelname}<br>
                        <button class='btn btn-primary btn-sm'>Open</button>`;
                    layer.bindPopup(
                        `${feature.properties.modelname}
                        <br><button class='btn btn-primary btn-sm'
                            onclick='popups_onclick("${feature.properties.modelname}")'
                            >Open</button>`
                    );
                }
                models.geojsonLayer = L.geoJson(geojson, {
                    onEachFeature: onEachFeature
                });
            })();
        },
    },
    watch: {
        models: function(newModels, oldModels) {
            this.hideGeojsonLayer(oldModels);
            this.createGeojsonLayer(newModels);
            this.showGeojsonLayer(newModels);
        },
    },
});

Vue.component('model', {
    template: '<div></div>',
    props: ['model'],
    created() {
        this.createGeojsonLayer(this.model);
        this.showGeojsonLayer(this.model);
    },
    destroyed() {
        this.isDestroyed = true;
        this.hideGeojsonLayer(this.model);
    },
    methods: {
        showGeojsonLayer,
        hideGeojsonLayer,
        createGeojsonLayer(model) {
            if(!model || model.geojsonLayer)
                return;

            model.geojsonLayer = (async () => {
                let geojson = await getJSON(`/api/models/${model.name}/geojson`);
                let pointToLayer = (feature, latlng) => {
                    var circle = L.circle(latlng, {
                        color: 'red',
                        weight: 2,
                        fillOpacity: 1,
                        radius: 3
                    });
                    circle._leaflet_id = feature.properties.id;
                    circle.on('click', (e) => {
                        this.nodeViewFrame.changeView(new ModelView.NodeView(e.target._leaflet_id));
                    });
                    return circle;
                }
                model.geojsonLayer = L.geoJson(geojson, {
                    pointToLayer: pointToLayer
                });
            })();
        },
    },
    watch: {
        model: function(newModel, oldModel) {
            this.hideGeojsonLayer(oldModel);
            this.createGeojsonLayer(newModel);
            this.showGeojsonLayer(newModel);
        }
    },
});

var modelViewer = new Vue({
    el: '#model-viewer',
    data: {
        models: null,
        model: null,
    },
    async created() {
        this.models = await getJSON("../api/models");
        this.models = this.models.reduce((obj, model) => {obj[model.name] = model; return obj;}, {});
    },
    mounted() {
        this.leafletMap = L.map('leaflet-map').setView([37.8,-122.0], 9);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.leafletMap);
    },
})



/*new Vue({
    el: '#map',
    mounted: function() {
        this._leafletMap = L.map(this.$el).setView([37.8,-122.0], 9);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this._leafletMap);
    }
});*/







/*
var url = "/model_viewer";
var leaflet_map;
var html = {};

class AllModelView extends viewlib.View {
    constructor() {
        if(AllModelView._instance)
            return AllModelView._instance;

        super();
        AllModelView._instance = this;
    }

    _onbuild(done) {
        getJSON("/api/models/geojson")
        .then(geojson => {
            var onEachFeature = function(feature, layer) {
                layer.bindPopup(
                    feature.properties.modelname +
                    "<br><button class='btn btn-primary btn-sm' " +
                        "onclick='popups_onclick(\"" + feature.properties.modelname + "\")'" +
                    ">Open</button>"
                );
            }

            this.layerGeoJson = L.geoJson(geojson, {
                onEachFeature: onEachFeature
            });

            done();
        });
    }

    _onshow(done) {
        html.modelmenu.value = '';
        history.replaceState(null, null, "./");
        this.layerGeoJson.addTo(leaflet_map);
        leaflet_map.fitBounds(this.layerGeoJson.getBounds());
        done();
    }

    _onhide(done) {
        this.layerGeoJson.remove();
        done();
    }
}

class ModelView extends viewlib.View {
    constructor(modelname) {
        if(ModelView._instances && ModelView._instances[modelname])
            return ModelView._instances[modelname];

        super();
        this.modelname = modelname;
        this.nodeViewFrame = new viewlib.ViewFrame(this);
        if(!ModelView._instances)
            ModelView._instances = {};
        ModelView._instances[modelname] = this;
    }

    _onbuild(done) {
        getJSON(`/api/models/${this.modelname}/geojson`)
        .then(geojson => {
            var pointToLayer = (feature, latlng) => {
                var circle = L.circle(latlng, {
                    color: 'red',
                    weight: 2,
                    fillOpacity: 1,
                    radius: 3
                });
                circle._leaflet_id = feature.properties.id;
                circle.on('click', (e) => {
                    this.nodeViewFrame.changeView(new ModelView.NodeView(e.target._leaflet_id));
                });
                return circle;
            }

            this.layerGeoJson = L.geoJson(geojson, {
                pointToLayer: pointToLayer
            });

            done();
        });
    }

    _onshow(done) {
        html.modelmenu.value = this.modelname;
        history.replaceState(null, null, `./${this.modelname}`);
        this.layerGeoJson.addTo(leaflet_map);
        leaflet_map.fitBounds(this.layerGeoJson.getBounds());
        done();
    }

    _onhide(done) {
        this.layerGeoJson.remove();
        done();
    }
}

ModelView.NodeView = class NodeView extends viewlib.View {
    constructor(node_id) {
        if(NodeView._instances && NodeView._instances[node_id])
            return NodeView._instances[node_id];

        super();
        this.node_id = node_id;
        if(!NodeView._instances)
            NodeView._instances = {};
        NodeView._instances[node_id] = this;
    }

    _onbuild(done) {
        this.nodeLayer = this.parentView.layerGeoJson.getLayer(this.node_id);
        getJSON(`/api/models/${this.parentView.modelname}/nodes/${this.node_id}`)
        .then(node => {
            var display = (num) => (num == null) ? "NA" : num;
            this.nodeLayer.bindPopup(
                `Node ${this.node_id}
                <br>VoltageA: ${display(node.VA)}
                <br>VoltageB: ${display(node.VB)}
                <br>VoltageC: ${display(node.VC)}`
            );
            done();
        });
    }

    _onshow(done) {
        this.nodeLayer.openPopup();
        done();
    }

    _onhide(done) {
        this.nodeLayer.closePopup();
        done();
    }
}

var mainViewFrame = new viewlib.ViewFrame();

window.onload = function () {
    leaflet_map = L.map('map').setView([37.8,-122.0], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(leaflet_map);

    html.modelmenu = document.getElementById('modelmenu');

    html.modelmenu.addEventListener("change", modelmenu_onchange);

    getJSON("../api/models").then((models) => {
        var newHtml = '<option value="">All</option>';
        for(var model of models)
            newHtml += `<option value="${model.name}">${model.name}</option>`;
        html.modelmenu.innerHTML = newHtml;

        if(djangoContext.modelname == '') {
            return mainViewFrame.changeView(new AllModelView());
        } else {
            return mainViewFrame.changeView(new ModelView(djangoContext.modelname));
        }
    });
};

function modelmenu_onchange() {
    if(html.modelmenu.value == '')
        mainViewFrame.changeView(new AllModelView());
    else
        mainViewFrame.changeView(new ModelView(html.modelmenu.value));
}

function popups_onclick(modelname) {
    mainViewFrame.changeView(new ModelView(modelname));
}
*/
