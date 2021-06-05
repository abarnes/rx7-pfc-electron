<template>
    <div class="gauge" v-bind:class="{ warning: shouldDisplayWarning, critical: shouldDisplayCritical }">
        <line-chart :chart-data="chartData" :options="chartOptions" v-if="config.showGraph" class="chart"></line-chart>
        <h3>{{ config.name }}</h3>
        <h1 v-html="displayValue" v-if="isConnected"></h1>
        <h1 v-else>-</h1>
    </div>
</template>

<script>
    import LineChart from './Gauge/LineChart.js'
    import ChartOptions from '../../config/ChartOptionConfig'
    import moment from 'moment'

    const MINIMUM_GRAPH_REFRESH_INTERVAL = (process.arch === "arm") ? 1000 : 250;

    export default {
        name: "Gauge",
        components: {
            LineChart
        },
        props: [
            "config",
            "isConnected"
        ],
        data () {
            return {
                addDataPointTimeout: null,
                data: [],
                chartData: {},
                chartOptions: ChartOptions,
                shouldDisplayWarning: false,
                shouldDisplayCritical: false
            }
        },
        computed: {
            rawValue () {
                return this.$store.state.EngineData[this.config.stateKey];
            },
            displayValue () {
                if (this.addDataPointTimeout === null) {
                    return "-";
                }

                return this.config.displaySuffix ? this.config.displaySuffix(this.transformValue(this.rawValue)) : this.transformValue(this.rawValue);
            }
        },
        watch: {
            rawValue: function() {
                if (this.config.showGraph) {
                    this.refreshChart(this.rawValue);
                }

                // check thresholds, add and remove classes
                if (this.config.thresholds) {
                    if (this.config.thresholds.critical.enabled && this.isBeyondThreshold(this.config.thresholds.critical) && !this.shouldDisplayCritical) {
                        this.shouldDisplayCritical = true;
                        this.shouldDisplayWarning = false;
                    } else if (this.config.thresholds.warning.enabled && this.isBeyondThreshold(this.config.thresholds.warning) && !this.shouldDisplayWarning && !this.shouldDisplayCritical) {
                        this.shouldDisplayWarning = true;
                        this.shouldDisplayCritical = false;
                    } else if (this.shouldDisplayWarning && !this.isBeyondThreshold(this.config.thresholds.warning)) {
                        this.shouldDisplayWarning = false;
                    } else if (this.shouldDisplayCritical && !this.isBeyondThreshold(this.config.thresholds.critical)) {
                        this.shouldDisplayCritical = false;
                    }
                }
            }
        },
        mounted() {
            if (this.config.showGraph) {
                this.data = this.createInitialData();
                this.refreshChart(this.rawValue);
            }
        },
        methods: {
            isBeyondThreshold(threshold) {
                return (((threshold.value <= this.rawValue) && threshold.greaterThan) || ((threshold.value >= this.rawValue) && !threshold.greaterThan));
            },

            refreshChart: function refreshChart(value) {
                if (this.addDataPointTimeout) {
                    clearTimeout(this.addDataPointTimeout);
                }
                
                const transformedValue = this.transformValue(value);
                this.data = this.updateChartData(transformedValue);
                this.chartData = {
                    datasets: [
                        {
                            label: '',
                            fill: false, // or "bottom"
                            borderColor: 'rgb(239, 239, 239)',
                            data: this.data,
                            borderWidth: 2,
                            spanGaps: true/*,
                            cubicInterpolationMode: "monotone"*/
                        }
                    ]
                }

                this.addDataPointTimeout = setTimeout(() => {
                    this.refreshChart(value);
                }, MINIMUM_GRAPH_REFRESH_INTERVAL);
            },

            updateChartData: function updateChartData(dataPoint, time) {
                let data = this.data;
                const now = time ? time : Date.now();

                if (!time) {
                    const oldestPoint = moment(now - (this.config.graphTime * 1000)); 
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].x.diff(oldestPoint) < 0) {
                            data.splice(i, 1);
                        } else {
                            break;
                        }
                    }
                }

                if (dataPoint !== null && dataPoint !== undefined) {
                    data.push({
                        x: moment(now),
                        y: dataPoint
                    });
                }
                
                return data;
            },

            transformValue(value) {
                return this.config.transform ? this.config.transform(value) : this.value;
            },

            createInitialData() {
                if (!this.config.graphTime) {
                    return [];
                }

                let array = [];
                const now = Date.now();
                const transformedValue = this.transformValue(this.rawValue);

                for (var i = this.config.graphTime; i > 0; i--) {
                    array.push({
                        x: moment(now - (i * 1000)),
                        y: transformedValue
                    });
                }

                return array;
            }
        }
    }
</script>

<style scoped>
    .gauge {
        padding: 0 0 0 25px;
        text-align: center;
        width: 31%;
        box-sizing: border-box;
        min-width: 100px;
        position: relative;
        border: 1px solid rgb(255, 255, 255);
        margin: 1% 1% 2%;
    }

    .warning {
        border-color: yellow;
    }

    .critical {
        border-color: #F92726;
    }

    .warning h1 {
        color: yellow;
    }

    .critical h1 {
        color: #F92726;
    }

    h1, h3 {
        color: rgb(227, 227, 227);
    }

    h1 {
        position: relative;
        z-index: 5;
        line-height: 2.9em;
        font-size: 3em;
    }

    h3 {
        position: relative;
        z-index: 5;
        /*color: #888;*/
        font-size: 18px;
        font-weight: initial;
        letter-spacing: .25px;
        margin-top: 10px;
    }

    .chart {
        position: absolute;
        opacity: 0.5;
        z-index: 0;
        left: 1%;
        right: 1%;
        bottom: 1%;
        top: 1%;
        width:98%; 
        max-height:98%;
        padding:5px;
        box-sizing: border-box;
    }
</style>
