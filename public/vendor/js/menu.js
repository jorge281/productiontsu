"use client";

const abrirMenu = () =>{
	// Verifica si el div contiene la clase 'miClase'
	$(".layout-menu-fixed").addClass("layout-menu-expanded");
}

const cerrarMenu = () =>{
	// Verifica si el div contiene la clase 'miClase'
	if ($(".layout-menu-fixed").hasClass('layout-menu-expanded')) {
		$(".layout-menu-fixed").removeClass("layout-menu-expanded");
	}
}

export { abrirMenu, cerrarMenu };