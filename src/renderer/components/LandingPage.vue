<template>
  <div id="wrapper">
    <!-- <img id="logo" src="~@/assets/logo.png" alt="electron-vue"> -->
    <main>
      <div class="message" v-if="this.shouldShowMessage">
        <h1>{{this.messageTitle}}</h1>
        <h2>{{this.messageSubtitle}}</h2>
      </div>
      <div class="monitors">
        <monitor v-for="(config, key) in monitors" :key="key" :config="config" :isConnected="isConnected"></monitor>
      </div>
      <div class="gauges">
        <gauge v-for="(config, key) in gauges" :key="key" :config="config" :isConnected="isConnected"></gauge>
      </div>
    </main>
  </div>
</template>

<script>
  import Gauge from './LandingPage/Gauge'
  import Monitor from './LandingPage/Monitor'
  import GaugeConfigX64 from '../config/GaugeConfigX64'
  import GaugeConfigARM from '../config/GaugeConfigARM'
  import { getLayoutConfig, getThresholdConfig } from '../utils/ConfigFileUtil'
  import DataRetriever from '../dataRetrieval/dataRetriever'
  import DataConnector from '../mock/MockDataConnector'
  // import DataConnector from '../../../serial/SerialConnector'
  import SerialConnectionStatus from '../../../serial/SerialConnectionStatus'

  import os from "os"

  export default {
    name: 'landing-page',
    components: { Gauge, Monitor },
    data() {
      return {
        shouldShowMessage: false,
        messageTitle: "",
        messageSubtitle: "",
        isConnected: false
      }
    },
    computed: {
      monitors () {
        return this.filterByType("monitors");
      },
      gauges () {
        return this.filterByType("gauges");
      }
    },
    created () {
      DataRetriever.listen(this.$store, this.handleConnectionStatusUpdate);
    },
    methods: {
      filterByType(type) {
        const layoutConfig = getLayoutConfig();
        const thresholdConfig = getThresholdConfig();
        const baseList = (process.arch === "arm") ? GaugeConfigARM.gauges : GaugeConfigX64.gauges;
        
        let items = [];
        for (let item of layoutConfig[type]) {

          if (typeof baseList[item] !== "undefined") {
            baseList[item].thresholds = thresholdConfig[item];
            items.push(baseList[item])
          } else {
            console.log("Undefined item!", item);
          }
        }
        return items;
      },

      handleConnectionStatusUpdate(status) {
        console.log("Status update! Status is now " + status);

        switch (status) {
          case SerialConnectionStatus.connected:
            this.shouldShowMessage = false;
            this.isConnected = true;
            break;
          case SerialConnectionStatus.disconnected:
            this.showMessage("Disconnected", "Failed to connect to ECM");
            break;
          case SerialConnectionStatus.connecting:
            this.showMessage("Connecting...", "");
            break;
          case SerialConnectionStatus.stalled:
            this.showMessage("Connection Error", "Communication with the ECM has stalled.");
            break;
        }
      },

      showMessage(title, subtitle) {
        this.messageTitle = title;
        this.messageSubtitle = subtitle;
        this.shouldShowMessage = true;
      }

    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html { -webkit-app-region: drag; overflow: hidden; }

  body { font-family: Arial, 'Source Sans Pro', sans-serif; }

  #wrapper {
    background-color: #222;
    height: 100vh;
  }

  .message {
    background: rgba(140, 140, 140, .9);
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 10;
  }

  .message h1, .message h2 {
    text-align: center;
    color: #fff;
    width: 100%;
    opacity: 1;
  }

  .message h1 {
    margin-top: 180px;
    font-size:3.5em;
  }

  .gauges, .monitors {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .monitors {
    align-items: center;
    justify-content: center;
    /* background-color:#95bbd6; */
    background-color: rgba(25, 25, 25, .9);
    height:7vh;
  }

  .gauges {
    padding: 30px 50px;
    align-items: baseline;
    justify-content: space-between;
  }
</style>
