<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Nelmio\ApiDocBundle\Annotation\Model;
use OpenApi\Annotations as OA;

/**
 * @ORM\Table(name="`notification`")
 * @ORM\Entity()
 */
class Notification
{
    // notification types
    const NEW_MESSAGE = 'new_message';
    const NEW_COMMENT = 'new_comment';
    const USER_JOINED_GROUP = 'user_joined_group';
    const USER_LEFT_GROUP = 'user_left_group';
    const GLOBAL_NOTIFICATION = 'global_notification';
    const GROUP_NAME_CHANGE = 'group_name_change';

    /**
     * @ORM\Id
     * @ORM\Column(type="guid")
     * @Groups({"read_notification"})
     * @Assert\NotBlank()
     * @OA\Property(type="guid")
     */
    private $id;

    /**
     * @ORM\Column(type="integer")
     * @Groups({"read_notification"})
     * @Assert\Type("integer")
     * @Assert\NotNull()
     * @OA\Property(type="integer")
     */
    private $createdAt;

    /**
     * @ORM\Column(type="string")
     * @Groups({"read_notification"})
     * @Assert\NotBlank()
     * @OA\Property(type="string")
     */
    private $type;

    /**
     * @ORM\Column(type="guid", unique=true)
     * @Assert\NotBlank()
     * @OA\Property(type="guid")
     */
    private $secretKey;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\User", inversedBy="notifications")
     * @ORM\JoinColumn(name="owner_id", referencedColumnName="id")
     * @OA\Property(type="App\Entity\User")
     */
    private $owner;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\File")
     * @ORM\JoinColumn(name="miniature_id", referencedColumnName="id")
     * @Groups({"read_notification"})
     * @OA\Property(type="App\Entity\File")
     */
    private $miniature;

    /**
     * @ORM\Column(type="string")
     * @Groups({"read_notification"})
     * @OA\Property(type="string")
     */
    private $target;

    /**
     * @ORM\Column(type="json", nullable=true)
     * @Groups({"read_notification"})
     * @Assert\NotBlank()
     * @OA\Property(type="object")
     */
    private $data;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\User")
     * @ORM\JoinColumn(name="from_user_id", referencedColumnName="id")
     * @Groups({"read_notification"})
     * @OA\Property(type="App\Entity\User")
     */
    private $fromUser;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Group")
     * @ORM\JoinColumn(name="from_group_id", referencedColumnName="id")
     * @Groups({"read_notification"})
     * @OA\Property(type="App\Entity\Group")
     */
    private $fromGroup;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Message")
     * @ORM\JoinColumn(name="from_message_id", referencedColumnName="id")
     * @Groups({"read_notification"})
     * @OA\Property(type="App\Entity\Message")
     */
    private $fromMessage;

    /**
     * @Groups({"read_notification"})
     * @OA\Property(type="string")
     */
    private $entityType;

    public function getEntityType(): string
    {
        return strtolower((new \ReflectionClass($this))->getShortName());
    }

    public function __construct()
    {
        $this->id = Uuid::uuidv4();
        $this->createdAt = time();
        $this->secretKey = Uuid::uuidv4();
        $this->data = [];
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getCreatedAt(): int
    {
        return $this->createdAt;
    }

    public function setCreatedAt(int $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): void
    {
        $this->type = $type;
    }

    public function getSecretKey(): string
    {
        return $this->secretKey;
    }

    public function resetSecretKey(): void
    {
        $this->secretKey = Uuid::uuidv4();
    }

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(User $owner): void
    {
        $this->owner = $owner;
    }

    public function getMiniature(): ?File
    {
        return $this->miniature;
    }

    public function setMiniature(File $miniature): void
    {
        $this->miniature = $miniature;
    }

    public function getTarget(): string
    {
        return $this->target;
    }

    public function setTarget(string $target): void
    {
        $this->target = $target;
    }

    public function getData(): ?array
    {
        return $this->data;
    }

    public function setData(array $data): void
    {
        $this->data = $data;
    }

    public function getFromUser(): ?User
    {
        return $this->fromUser;
    }

    public function setFromUser(User $fromUser): void
    {
        $this->fromUser = $fromUser;
    }

    public function getFromGroup(): ?Group
    {
        return $this->fromGroup;
    }

    public function setFromGroup(Group $fromGroup): void
    {
        $this->fromGroup = $fromGroup;
    }

    public function getFromMessage(): ?Message
    {
        return $this->fromMessage;
    }

    public function setFromMessage(Message $fromMessage): void
    {
        $this->fromMessage = $fromMessage;
    }
}
