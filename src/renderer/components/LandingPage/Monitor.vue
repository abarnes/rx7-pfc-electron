<template>
    <div class="monitor">
        <h4>{{ this.config.name }} <span v-html="this.displayValue" v-if={isConnected}></span><span v-else>-</span></h4>
    </div>
</template>

<script>
    export default {
        name: "Monitor",
        props: [
            "config",
            "isConnected"
        ],
        computed: {
            displayValue () {
                const transformedValue = this.config.transform ? this.config.transform(this.$store.state.EngineData[this.config.stateKey]) : this.$store.state.EngineData[this.config.stateKey];
                return this.config.displaySuffix ? this.config.displaySuffix(transformedValue) : transformedValue;
            }
        }
    }
</script>

<style scoped>
    .monitor {
        text-align: center;
        width: 20%;
        box-sizing: border-box;
        min-width: 100px;
        position: relative;
    }

    h4 {
        color: rgb(199, 199, 199);
        font-size: 12px;
        line-height: 34px;
        padding: 0;
        font-weight: 100;
    }

    h4 span {
        color: rgb(227, 227, 227);
        font-size: 18px;
    }
</style>
