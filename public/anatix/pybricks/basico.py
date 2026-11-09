"""
Exemplo Anatix — básico

Coloque este arquivo e o anatix.py no mesmo projeto do Pybricks Code
(ou na mesma pasta, se usar o pybricksdev). Rode o programa e conecte
o painel do Anatix por Bluetooth ou cabo USB.
"""
from pybricks.hubs import PrimeHub
from pybricks.tools import wait, StopWatch

from anatix import anx

hub = PrimeHub()
anx.begin("MeuRobo", hub)  # com o hub: envia "hub_bateria_v" sozinho

relogio = StopWatch()
contador = 0

while True:
    anx.update()  # obrigatório, 1x por volta do loop

    inclinacao, rolagem = hub.imu.tilt()
    anx.value("inclinacao_graus", inclinacao)
    anx.value("rolagem_graus", rolagem)
    anx.value("aceleracao_x", hub.imu.acceleration()[0], every=200)

    with anx.scope("calculo"):  # mede quanto tempo o bloco leva
        contador += 1
        quadrado = contador * contador

    if hub.buttons.pressed():
        anx.event("botao", contador)
        anx.state("modo", "botao_apertado")
    else:
        anx.state("modo", "ocioso")

    if relogio.time() > 5000:
        anx.log("passaram 5 s, contador = %d" % contador)
        relogio.reset()

    wait(10)
