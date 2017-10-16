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

class SelectModel extends View {
    constructor(parent) {
        super('span', parent);
        this.models = [];
        this.getModels().then((models) => {
            this.models = models;
            this.render();
        });
        this._methods.onchange = (e) => {
            this.parent.model = this._html.select.value;
        };
        this.render();
    }
    getModels() {
        return this.parent.getModels();
    }
    get _template() {
        return `
        Select a model to display: <select data-name="select" data-on="change:onchange" class="custom-select">
            <option value="">All</option>
            ${ FOR(this.models, (modelname) =>
                `<option value"${modelname}">${modelname}</option>`
            )}
        </select>`;
    }
    set model(val) { this.getModels().then(() => this._html.select.value = val); }
}

class LeafletMap extends View {
    constructor(el) {
        super('div', el);
        this.render();
    }
    render() {
        super.render();
        this.map = L.map(this._html.el).setView([37.8,-122.0], 9);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
    }
    emplace(el) {
        super.emplace(el);
        this.map.invalidateSize();
    }
}

class ModelPopup extends View {
    constructor(parent, modelname) {
        super('div', parent);
        this.modelname = modelname;
        this._methods.onclick = (e) => {
            this.parent.model = modelname;
        };
        this.render();
    }
    get _template() {
        return `
        ${this.modelname}<br>
        <button class='btn btn-primary btn-sm' data-on="click:onclick">Open</button>`;
    }
}

class ModelViewer extends View {
    constructor(el) {
        super('div',el);
        this.models = this.getModels();
        this._childs['select-model'] = new SelectModel(this);
        this._childs['leaflet-map'] = new LeafletMap();
    }
    get model() { return this._model; }
    set model(newModel) {
        if(newModel === this._model)
            return;
        if(this._model === '')
            this._getAllModelsLayer().then((layer) => layer.remove());
        this._model = newModel;
        if (this._model === '')
            this._getAllModelsLayer().then((layer) => {
                layer.addTo(this.child('leaflet-map').map);
                this.child('leaflet-map').map.fitBounds(layer.getBounds());
            });
        this.render();
        this.child('select-model').model = this._model;
        //this.child('model-info').model = this._model;
    }
    getModels() {
        if(this._modelsProm)
            return this._modelsProm;
        return this._modelsProm = (async () => {
            this.models = await getJSON('/api/models');
            this.models = this.models.reduce((obj, model) => {obj[model.name] = model; return obj;}, {});
            return this.models;
        })();
    }
    _getAllModelsLayer() {
        if (this._allModelsLayerProm)
            return this._allModelsLayerProm;
        return this._allModelsLayerProm = (async () => {
            let geojson = await getJSON('/api/models/geojson');
            let onEachFeature = (feature, layer) => {
                let popup = new ModelPopup(this, feature.properties.modelname);
                layer.bindPopup(popup.el);
            }
            return L.geoJson(geojson, {
                onEachFeature: onEachFeature
            });
        })();
    }
    get _template() {
        return `
        <div data-childview="select-model"></div>

        <div data-childview="leaflet-map" style="height: 70vh; margin: 1rem 0 1rem 0;"></div>`;
    }
}

var test = new ModelViewer();
test.emplace(document.querySelector('#model-viewer'));
test.render();
//test.model = '';
test.model = 'BU0001';

/*
Vue.component('model-info', {
    props: ['model'],
    created() {
        if(this.model === null) {
            this.createAllModelsLayer();
            this.showLayer(this.allModelsLayer);
        }
        else {
            this.createModelsLayer(this.model);
            this.showLayer(this.model.layer);
        }
    },
    destroyed() {
        if (this.model)
            this.hideLayer(this.model.layer);
        else
            this.hideLayer(this.allModelsLayer);
    },
    methods: {
        async showLayer(layer) {
            if(layer instanceof Promise)
                layer = await layer;
            layer.addTo(modelViewer.leafletMap);
            modelViewer.leafletMap.fitBounds(layer.getBounds());
        },
        async hideLayer(layer) {
            if(layer instanceof Promise)
                layer = await layer;
            layer.remove();
        },
        createAllModelsLayer() {
            if (this.allModelsLayer)
                return;

            this.allModelsLayer = (async () => {
                let geojson = await getJSON('/api/models/geojson');
                let onEachFeature = (feature, layer) => {
                    let popup = document.createElement('div');
                    popup.innerHTML =
                        `${feature.properties.modelname}<br>
                        <button class='btn btn-primary btn-sm'>Open</button>`;
                    popup.getElementsByTagName('button')[0].addEventListener('click', () => {
                        this.$parent.model = this.$parent.models[feature.properties.modelname];
                    });
                    layer.bindPopup(popup);
                }
                return this.allModelsLayer = L.geoJson(geojson, {
                    onEachFeature: onEachFeature
                });
            })();
        },
        createModelLayer(model) {
            if(model.layer)
                return;

            model.layer = (async () => {
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
                        this.node =
                        this.nodeViewFrame.changeView(new ModelView.NodeView(e.target._leaflet_id));
                    });
                    return circle;
                }
                return model.layer = L.geoJson(geojson, {
                    pointToLayer: pointToLayer
                });
            })();
        },
    },
    watch: {
        model: function(newModel, oldModel) {
            if(oldModel)
                this.hideLayer(oldModel.layer);
            else
                this.hideLayer(this.allModelsLayer);

            if(newModel) {
                this.createModelLayer(newModel);
                this.showLayer(newModel.layer);
            } else {
                this.createAllModelsLayer();
                this.showLayer(this.allModelsLayer);
            }
        }
    },
});

var modelViewer = new Vue({
    el: '#model-viewer',
    data: {
        models: undefined,
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
*/
