const types = {
    monitor: "m",
    gauge: "g"
}

const isMonitor = (item) => {
    return item.type == types.monitor;
}

const isGauge = (item) => {
    return item.type == types.gauge;
}

export default { types, isMonitor, isGauge }