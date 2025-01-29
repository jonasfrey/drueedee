
import {
    f_add_css,
    f_s_css_prefixed,
    o_variables, 
    f_s_css_from_o_variables
} from "https://deno.land/x/f_add_css@2.0.0/mod.js"

import {
    f_o_html__and_make_renderable,
}from 'https://deno.land/x/f_o_html_from_o_js@5.0.0/mod.js'


import {
    f_o_webgl_program,
    f_delete_o_webgl_program,
    f_resize_canvas_from_o_webgl_program,
    f_render_from_o_webgl_program
} from "https://deno.land/x/handyhelpers@5.0.0/mod.js"

import {
    f_s_hms__from_n_ts_ms_utc,
} from "https://deno.land/x/date_functions@2.0.0/mod.js"  

let a_o_shader = []
let n_idx_a_o_shader = 0;
let o_state = {
    o_shader: {},
    o_state_notifire: {},
    n_idx_a_o_shader,
    a_o_shader,
}

globalThis.o_state = o_state
o_variables.n_rem_font_size_base = 1. // adjust font size, other variables can also be adapted before adding the css to the dom
o_variables.n_rem_padding_interactive_elements = 0.5; // adjust padding for interactive elements 
f_add_css(
    `
    body{
        min-height: 100vh;
        min-width: 100vw;
        /* background: rgba(0,0,0,0.84);*/
        display:flex;
        justify-content:center;
        align-items:flex-start;
    }
    canvas{
        width: 10vw;
        height: 10vh;
        position:fixed;
        z-index:-1;
        top: 1vh;
        left: 1vw;
    }
    #o_el_time{
        margin:1rem;
        background: rgba(0, 0, 0, 0.4);
        padding: 1rem;
        display: none;
    }
    ${
        f_s_css_from_o_variables(
            o_variables
        )
    }
    `
);

// it is our job to create or get the cavas
let o_canvas = document.createElement('canvas'); // or document.querySelector("#my_canvas");
document.body.appendChild(o_canvas);


let o_webgl_program = null;
let f_update_shader = function(){

    if(o_webgl_program){
        f_delete_o_webgl_program(o_webgl_program)
    }
    o_webgl_program = f_o_webgl_program(
        o_canvas,
        `#version 300 es
        in vec4 a_o_vec_position_vertex;
        void main() {
            gl_Position = a_o_vec_position_vertex;
        }`, 
        `#version 300 es
        precision mediump float;
        in vec2 o_trn_nor_pixel;
        out vec4 fragColor;
        uniform vec4 iMouse;
        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec4 iDate;
    
        float f_n_d_rect(
            vec2 o_trn
        ){
            return abs(max(abs(o_trn.x), abs(o_trn.y)));
        }

        void main() {
            float n_scl_min = min(iResolution.x, iResolution.y);
            vec2 o_trn = (gl_FragCoord.xy-iResolution.xy*.5)/n_scl_min;
            o_trn *=5.;

            o_trn.y += sin(o_trn.x+iTime*2.)*0.05;
            float n1 = f_n_d_rect(o_trn);
            float n2 = f_n_d_rect(o_trn*vec2(1.-(1./6.), 1.)+vec2(1.0-(1./6./2.), 0.));
            float n3 = f_n_d_rect(o_trn*vec2(-1.+(1./6.), 1.)+vec2(1.0-(1./6./2.), 0.));
            float n4 = f_n_d_rect(o_trn*vec2(1.,1.-(1./6.))+vec2(0.,1.0-(1./6./2.)));
            float n5 = f_n_d_rect(o_trn*vec2(1.,-1.+(1./6.))+vec2(0.,1.0-(1./6./2.)));
            float n = min(n1, min(n2, min(n3, min(n4, n5))));
            n = smoothstep(0.5, 0.52, n);
            // float n = length(o_trn);
            vec3 o_col = vec3(n, 0., 0.);
            o_col += vec3(1.)*1.-n;


            fragColor = vec4(
                o_col, 
                1.0
            );
        }
        `
    )
    
    o_state.o_ufloc__iResolution = o_webgl_program?.o_ctx.getUniformLocation(o_webgl_program?.o_shader__program, 'iResolution');
    o_state.o_ufloc__iDate = o_webgl_program?.o_ctx.getUniformLocation(o_webgl_program?.o_shader__program, 'iDate');
    o_state.o_ufloc__iMouse = o_webgl_program?.o_ctx.getUniformLocation(o_webgl_program?.o_shader__program, 'iMouse');
    o_state.o_ufloc__iTime = o_webgl_program?.o_ctx.getUniformLocation(o_webgl_program?.o_shader__program, 'iTime');

    f_resize()
}

// just for the demo 
// o_canvas.style.position = 'fixed';
// o_canvas.style.width = '100vw';
// o_canvas.style.height = '100vh';
let f_resize = function(){
    if(o_webgl_program){
        // this will resize the canvas and also update 'o_scl_canvas'
        f_resize_canvas_from_o_webgl_program(
            o_webgl_program,
            globalThis.innerWidth, 
            globalThis.innerHeight
        )
    
        o_webgl_program?.o_ctx.uniform2f(o_state.o_ufloc__iResolution,
            globalThis.innerWidth, 
            globalThis.innerHeight
        );
    
        f_render_from_o_webgl_program(o_webgl_program);
    }
}

globalThis.addEventListener('resize', ()=>{
    f_resize();
});

let n_id_raf = 0;


let mouseX = 0;
let mouseY = 0;
let clickX = 0;
let clickY = 0;
let isMouseDown = false;

// Event listener for mouse move
o_canvas.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

// Event listener for mouse down
o_canvas.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    clickX = event.clientX;
    clickY = event.clientY;
});

// Event listener for mouse up
o_canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

let o_el_time = document.createElement('div');
o_el_time.id = 'o_el_time'
// document.body.appendChild(o_el_time);


let n_ms_update_time_last = 0;
let n_ms_update_time_delta_max = 1000;
let f_raf = function(){

    if(o_webgl_program){
        let o_date = new Date();
        let n_sec_of_the_day_because_utc_timestamp_does_not_fit_into_f32_value = (o_date.getTime()/1000.)%(60*60*24)
        // n_sec_of_the_day_because_utc_timestamp_does_not_fit_into_f32_value = (60*60*24)-1 //test
        o_webgl_program?.o_ctx.uniform4f(o_state.o_ufloc__iDate,
            o_date.getUTCFullYear(),
            o_date.getUTCMonth(), 
            o_date.getUTCDate(),
            n_sec_of_the_day_because_utc_timestamp_does_not_fit_into_f32_value
        );
        o_webgl_program?.o_ctx.uniform4f(o_state.o_ufloc__i_mouse,
            isMouseDown ? mouseX : 0.0,
            isMouseDown ? mouseY : 0.0,
            clickX,
            clickY
        );
        o_webgl_program?.o_ctx.uniform1f( o_state.o_ufloc__iTime,
            n_sec_of_the_day_because_utc_timestamp_does_not_fit_into_f32_value
        );
       
        let s_time = `${f_s_hms__from_n_ts_ms_utc(o_date.getTime(), 'UTC')}.${((o_date.getTime()/1000)%1).toFixed(3).split('.').pop()}`
        o_el_time.innerText = `UTC: ${s_time}`
    
        let n_ms = globalThis.performance.now()
        let n_ms_delta = Math.abs(n_ms_update_time_last - n_ms);
        if(n_ms_delta > n_ms_update_time_delta_max){
            document.title = `${s_time.split('.').shift()} DrüüDee.ch` 
            n_ms_update_time_last = n_ms;
        }
        f_render_from_o_webgl_program(o_webgl_program);
    }

    n_id_raf = requestAnimationFrame(f_raf)

}
n_id_raf = requestAnimationFrame(f_raf)


let n_id_timeout = 0;
globalThis.onpointermove = function(){
    clearTimeout(n_id_timeout);
    o_el_time.style.display = 'block'
    n_id_timeout = setTimeout(()=>{
        o_el_time.style.display = 'none'
    },5000)
}
globalThis.onpointerdown = function(){
    o_state.n_idx_a_o_shader = (o_state.n_idx_a_o_shader+1)% o_state.a_o_shader.length;
    o_state.o_shader = o_state.a_o_shader[o_state.n_idx_a_o_shader]
    f_update_shader();
}
f_update_shader()


// Determine the current domain
const s_hostname = globalThis.location.hostname;

// Create the WebSocket URL, assuming ws for http and wss for https
const s_protocol_ws = globalThis.location.protocol === 'https:' ? 'wss:' : 'ws:';
const s_url_ws = `${s_protocol_ws}//${s_hostname}:${globalThis.location.port}`;

// Create a new WebSocket instance
const o_ws = new WebSocket(s_url_ws);

// Set up event listeners for your WebSocket
o_ws.onopen = function(o_e) {
    console.log({
        o_e, 
        s: 'o_ws.onopen called'
    })
};

o_ws.onerror = function(o_e) {
    console.log({
        o_e, 
        s: 'o_ws.onerror called'
    })
};

o_ws.onmessage = function(o_e) {
    console.log({
        o_e, 
        s: 'o_ws.onmessage called'
    })
    o_state.a_o_msg.push(o_e.data);
    o_state?.o_js__a_o_mod?._f_render();

};
globalThis.addEventListener('pointerdown', (o_e)=>{
    o_ws.send('pointerdown on client')
})


document.body.appendChild(
    await f_o_html__and_make_renderable(
        {
            style: "display:flex;flex-direction:column;align-items:center;justify-content:center;min-height: 100vh",
            a_o: [
                {
                    // style: 'color: #111',
                    innerText: 'druedee@proton.me'
                }
            ]
        }
    )
)
