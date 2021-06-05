const options = {
    responsive: true, 
    maintainAspectRatio: false,
    legend: {
        display: false
    },
    scales: {
        xAxes: [{
            display: false,
            type: "time",
            ticks: {
                source: "data"
            }
        }],
        yAxes: [{
            ticks: {
                //beginAtZero: true,
                maxTicksLimit: 4,
                fontColor: "rgb(239, 239, 239)"
            },
            gridLines: {
                display: false
            }
        }]
    },
    animation: {
        duration: 0, // general animation time
    },
    hover: {
        animationDuration: 0, // duration of animations when hovering an item
    },
    responsiveAnimationDuration: 0, // animation duration after a resize
    elements: { 
        point: { 
            radius: 0 
        } 
    }
};

module.exports = options;