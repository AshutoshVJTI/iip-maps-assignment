import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import './india-map.css';

const IndiaMap = () => {
    const [selectedStates, setSelectedStates] = useState(() =>
        JSON.parse(localStorage.getItem("selectedStates")) || []
    );
    const [tooltipState, setTooltipState] = useState({ name: null, x: 0, y: 0 });

    useEffect(() => {
        const svg = d3
            .select("#map")
            .attr("width", 1200)
            .attr("height", 750);

        d3.json(require("../assets/india_states.geojson")).then(data => {
            const projection = d3.geoMercator().fitSize([1200, 750], data);
            const pathGenerator = d3.geoPath().projection(projection);

            svg
                .selectAll(".state")
                .data(data.features)
                .join(
                    enter => enter
                        .append("path")
                        .attr("class", "state")
                        .attr("d", pathGenerator)
                        .attr("stroke", "black")
                        .on("mouseover", (event, d) => {
                            const [x, y] = d3.pointer(event);
                            setTooltipState({ name: d.properties.ST_NM, x: x, y: y });
                        })
                        .on("mouseout", () => {
                            setTooltipState({ name: null, x: 0, y: 0 });
                        }),
                    update => update,
                    exit => exit.remove()
                )
                .attr("fill", d => (selectedStates.includes(d.properties.ST_NM) ? "red" : "#fff"))
                .on("click", function (d) {
                    const stateName = d.target.__data__.properties.ST_NM;
                    let newSelectedStates;
                    if (selectedStates.includes(stateName)) {
                        newSelectedStates = selectedStates.filter(state => state !== stateName);
                    } else {
                        newSelectedStates = [...selectedStates, stateName];
                    }
                    setSelectedStates(newSelectedStates);
                    d3.select(this).attr("fill", newSelectedStates.includes(stateName) ? "red" : "#ccc");
                });
        });
    }, [selectedStates]);

    useEffect(() => {
        localStorage.setItem("selectedStates", JSON.stringify(selectedStates));
    }, [selectedStates]);

    return (
        <div id="mapContainer">
            <svg id="map" />
            <div
                id="tooltip"
                style={{ top: `${tooltipState.y}px`, left: `${tooltipState.x}px` }}
                className={tooltipState.name ? 'visible' : ''}
            >
                {tooltipState.name}
            </div>
        </div>
    );
};

export default IndiaMap;
