import Image from 'next/image'
import { abrirMenu, cerrarMenu} from '../public/vendor/js/menu.js'

export default function Home() {
  return (
    <div className="row">
                <div className="col-lg-8 mb-4 order-0">
                  <div className="card">
                    <div className="d-flex align-items-end row">
                      <div className="col-sm-12">
                        <div className="card-body">
                          <h5 className="card-title text-primary">Bienvenido</h5>
                          <p className="mb-4">
                            -2 Novedades por solucionar
                            <br></br>
                            -Te falta un 30% para lograr tu meta
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-4 order-1">
                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-6 mb-4">
                      <div className="card">
                        <div className="card-body">
                          <div className="card-title d-flex align-items-start justify-content-between">
                            <div className="avatar flex-shrink-0">
                              <img
                                src="icons/unicons/chart-success.png"
                                alt="chart success"
                                className="rounded"
                              />
                            </div>
                            <div className="dropdown">
                              <button
                                className="btn p-0"
                                type="button"
                                id="cardOpt3"
                                data-bs-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                              >
                                <i className="bx bx-dots-vertical-rounded"></i>
                              </button>
                              <div className="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt3">
                                <a className="dropdown-item" href="">View More</a>
                                <a className="dropdown-item" href="">Delete</a>
                              </div>
                            </div>
                          </div>
                          <h3 className="card-title mb-2">$720.000</h3>
                          <small className="text-success fw-semibold"><i className="bx bx-up-arrow-alt"></i> $600.000</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  )
}
