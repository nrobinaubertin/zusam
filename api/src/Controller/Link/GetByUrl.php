<?php

namespace App\Controller\Link;

use App\Controller\ApiController;
use Doctrine\ORM\EntityManagerInterface;
use App\Service\Url as UrlService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;

class GetByUrl extends ApiController
{
    private $urlService;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        UrlService $urlService
    ) {
        parent::__construct($em, $serializer);
        $this->urlService = $urlService;
    }

    /**
     * @Route("/links/by_url", methods={"POST"})
     * @OA\RequestBody(
     *  @OA\Schema(
     *    type="object",
     *    @OA\Property(
     *      property="name",
     *      type="string"
     *    ),
     *    @OA\Property(
     *      property="rescan",
     *      type="boolean"
     *    ),
     *    @OA\Property(
     *      property="onlyData",
     *      type="boolean"
     *    ),
     *  )
     * )
     * @OA\Response(
     *  response=200,
     *  description="Get a link by its url",
     *  @OA\JsonContent(
     *    type="object",
     *    @OA\Property(property="id", type="string"),
     *    @OA\Property(property="data", type="object"),
     *    @OA\Property(property="url", type="string"),
     *    @OA\Property(property="updatedAt", type="integer"),
     *    @OA\Property(
     *      property="preview",
     *      type="object",
     *      @OA\Property(property="id", type="string"),
     *      @OA\Property(property="entityType", type="string")
     *    )
     *  )
     * )
     * @OA\Tag(name="link")
     * @Security(name="api_key")
     */
    public function getLinkByPost(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $data = json_decode($request->getContent(), true);
        $url = $data['url'] ?? '';
        if (!$url) {
            return new JsonResponse(['error' => 'Invalid url'], Response::HTTP_BAD_REQUEST);
        }
        $rescan = $data['rescan'] ?? false;
        $onlyData = $data['onlyData'] ?? false;

        return $this->execute($url, $rescan, $onlyData);
    }

    /**
     * @Route("/links/by_url", methods={"GET"})
     * @OA\Parameter(
     *  name="url",
     *  in="query",
     * )
     * @OA\Response(
     *  response=200,
     *  description="Get a link by its url",
     *  @OA\JsonContent(
     *    type="object",
     *    @OA\Property(property="id", type="string"),
     *    @OA\Property(property="data", type="object"),
     *    @OA\Property(property="url", type="string"),
     *    @OA\Property(property="updatedAt", type="integer"),
     *    @OA\Property(
     *      property="preview",
     *      type="object",
     *      @OA\Property(property="id", type="string"),
     *      @OA\Property(property="entityType", type="string")
     *    )
     *  )
     * )
     * @OA\Tag(name="link")
     * @Security(name="api_key")
     */
    public function getLinkByGet(Request $request): Response
    {
        // No api token verification because this endpoint is used in public posts

        $url = $request->query->get('url') ?? '';
        if (!$url) {
            return new JsonResponse(['error' => 'Invalid url'], Response::HTTP_BAD_REQUEST);
        }

        return $this->execute(rawurldecode($url));
    }

    private function execute(string $url, bool $rescan = false, bool $onlyData = false): Response
    {
        $data = $this->getLinkData($url, $rescan, $onlyData);
        $response = new JsonResponse($data, Response::HTTP_OK);
        $response->setCache([
            'etag' => md5(json_encode($data)),
            'max_age' => 0,
            's_maxage' => 3600,
            'public' => true,
        ]);

        return $response;
    }

    public function getLinkData(string $url, bool $rescan = false, bool $onlyData = false): array
    {
        $link = $this->urlService->getLink($url, $rescan);
        if (!$onlyData) {
            return [
                'id' => $link->getId(),
                'data' => $link->getData(),
                'url' => $url,
                'updatedAt' => $link->getUpdatedAt(),
                'preview' => $link->getPreview() ? [
                    'id' => $link->getPreview()->getId(),
                    'entityType' => $link->getPreview()->getEntityType(),
                ] : '',
            ];
        } else {
            return json_decode($link->getData(), true);
        }
    }
}
